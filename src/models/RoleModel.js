const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const modelSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
});

module.exports = mongoose.model('roles', modelSchema);