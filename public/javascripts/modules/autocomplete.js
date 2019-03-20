function autocomplete(input, latInput, lngInput) {
    if(!input) return;
    const dropdown = new google.maps.places.Autocomplete(input);
    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        latInput.value = lat;
        lngInput.value = lng;
    });
    input.addEventListener('keydown', (e) => {
        if(e.keyCode === 13) e.preventDefault();
    })
}

export default autocomplete;