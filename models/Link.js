const {Schema, model} = require('mongoose');

const Link = new Schema({
    original_link: {type: String},
    shorter_link: {type: String},
    User: {type: String, ref: 'User'}
})

module.exports = model('Link', Link)