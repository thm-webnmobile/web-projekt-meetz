const mongoose = require('mongoose')

const profileSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    birthday: {
        type: Date,
        required: true
    },
    bio: {
        type: String,
        trim: true
    },
    avatar: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Image'
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Image'
    }]
})

const Profile = mongoose.model('Profile', profileSchema)

module.exports = Profile
