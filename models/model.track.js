const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
    link: {
        type: String,
        // required: true,
    },
    joinedCount: {
        type: Number,
        default: 0,
    },
    leftCount: {
        type: Number,
        default: 0,
    },
});

const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = Tracking;
