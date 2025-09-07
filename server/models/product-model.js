const mongoose= require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    
    categoryID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }],
    images: [{
        type: String,
        required: false
    }],
    attributes:{
        material: {
            type: String,
            required: true
        },
        origin: {
            type: String,
            required: true
        }
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default:true
    },
    variant: [{
        color: {
            type: String
        },
        size: {
            type: String
            
        },
        price: {
            type: Number,
            required: true
        },
        QTyavailable: {
            type: Number,
            required: true
        },
        Qtyreserved: {
            type: Number,
            default: 0
        },
        reorderPoint:{
            type: Number,
            required: true
        }
        

    }],

   
    
    
},{timestamps:true});



module.exports = mongoose.model('Product', productSchema);



    
