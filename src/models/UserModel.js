const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const modelSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    nick_name: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    birth_day: {
        type: Number,
        required: false,
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'roles',
    },
    refresh_token: {
        type: String,
        required: false,
    }
});

module.exports = mongoose.model('users', modelSchema);