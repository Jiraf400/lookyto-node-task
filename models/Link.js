const {Schema, model} = require('mongoose');

const Link = new Schema({
    original_link: {type: String},
    hashed_link: {type: String},
    user: {type: Schema.Types.ObjectId, ref: 'User'}
})

module.exports = model('Link', Link)