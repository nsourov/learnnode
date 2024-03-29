const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

const StoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Please enter a slug name!"
    },
    slug: String,
    description: {
      type: String,
      trim: true
    },
    tags: [String],
    created: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: [
        {
          type: Number,
          required: "You must supply coordinates"
        }
      ],
      address: {
        type: String,
        required: "You must supply address"
      }
    },
    photo: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: "You must supply an author"
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

StoreSchema.index({
  name: "text",
  description: "text"
});

StoreSchema.index({
  location: "2dsphere"
});

StoreSchema.pre("save", async function(next) {
  if (!this.isModified("name")) {
    next();
    return;
  }
  this.slug = slug(this.name);
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
  const storeWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storeWithSlug.length) {
    this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
  }
  next();
});

StoreSchema.statics.getTagsList = function() {
  return this.aggregate([
    {
      $unwind: "$tags"
    },
    {
      $group: { _id: "$tags", count: { $sum: 1 } }
    },
    { $sort: { count: -1 } }
  ]);
};

StoreSchema.statics.getTopStores = function() {
  return this.aggregate([
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "store",
        as: "reviews"
      }
    },
    { $match: { "reviews.1": { $exists: true } } },
    {
      $project: {
        photo: "$$ROOT.photo",
        name: "$$ROOT.name",
        reviews: "$$ROOT.reviews",
        slug: "$$ROOT.slug",
        averageRating: { $avg: "$reviews.rating" }
      }
    },
    { $sort: { averageRating: -1 } },
    { $limit: 10 }
  ]);
};

StoreSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "store"
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}
StoreSchema.pre('find', autopopulate);
StoreSchema.pre('findOne', autopopulate);

module.exports = mongoose.model("Store", StoreSchema);
