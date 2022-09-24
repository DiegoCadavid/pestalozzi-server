const { Schema, model } = require('mongoose');

const carouselModel = new Schema({
    imageId: { type: Schema.Types.ObjectId, ref: 'Galery'},
    label: { type: Schema.Types.String }
});

const Carousel = model('Carousel', carouselModel);
module.exports = Carousel;