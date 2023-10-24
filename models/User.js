const {Schema, model} = require('mongoose')

const User = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    links: [{type: Schema.Types.ObjectId, ref: 'Link'}]
});

module.exports = model('User', User);