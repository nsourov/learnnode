const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const User = mongoose.model("User");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed!" }, false);
    }
  }
};

exports.homePage = (req, res) => {
  return res.render("index");
};

exports.addStore = (req, res) => {
  return res.render("editStore", { title: "Add Store" });
};

exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();
  req.flash(
    "success",
    `Successfully Created ${store.name}. Care to leave a review?`
  );
  return res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find().populate('reviews');
  return res.render("stores", { title: "Stores", stores, user: req.user });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw new Error("You must own the store in order to edit this!");
  }
};

exports.editStore = async (req, res) => {
  const store = await Store.findById(req.params.storeId);
  confirmOwner(store, req.user);
  return res.render("editStore", { title: `Edit ${store.name}`, store });
};
exports.updateStore = async (req, res) => {
  req.body.location.type = "Point";
  const store = await Store.findByIdAndUpdate(req.params.storeId, req.body, {
    new: true,
    runValidators: true
  }).exec();
  req.flash("success", "Successfully Updated");
  return res.redirect(`/stores/${store.slug}`);
};
exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    "author reviews"
  );
  if (!store) {
    next();
    return;
  }
  return res.render("store", { store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  return res.render("tag", { title: "Tags", tags, tag, stores });
};

exports.searchStores = async (req, res) => {
  const stores = await Store.find(
    {
      $text: {
        $search: req.query.q
      }
    },
    {
      score: { $meta: "textScore" }
    }
  )
    .sort({
      score: { $meta: "textScore" }
    })
    .limit(5);
  return res.json(stores);
};

exports.mapStore = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates
        },
        $maxDistance: 10000
      }
    }
  };
  const stores = await Store.find(q).limit(10);
  return res.json(stores);
};

exports.mapPage = (req, res) => {
  return res.render("map", { title: "Map" });
};
exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? "$pull" : "$addToSet";
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      [operator]: { hearts: req.params.id }
    },
    { new: true }
  );
  return res.json(user);
};

exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  });
  return res.render("stores", { title: "Hearted Stores", stores });
};
exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();
  res.render("topStores", { title: "Top Stores!", stores });
};
