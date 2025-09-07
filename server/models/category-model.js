const mongoose = require('mongoose');
const path = require('path');

const CategorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    parentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null},
    isDeleted: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
