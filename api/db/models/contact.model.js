const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        minlength: 8,
        trim: true
    },
    email: {
        type: String,
        required: true,
        minlength: 4,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },

    // the user that this contact belongs to
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = { Contact };