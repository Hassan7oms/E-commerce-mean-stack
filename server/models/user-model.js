const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    name: {
        first: {
            type: String,
            required: true
        },
        last: {
            type: String,
            required: true
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    addresses:[{
        label: String,
        street: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        country: {
            type: String,
            required: false
        },
        zip: {
            type: String,
            required: false
        },
        area: {
            type: String,
            required: false
        },
        building: String,
        apartment: String,
        isdefault: Boolean

    }],
    isDeleted: {
        type: Boolean,
        default: false
    }

    
},{timestamps:true});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});  

userSchema.methods.comparePassword = async function(inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
