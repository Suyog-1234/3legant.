import mongoose, { Document, Schema } from "mongoose";
import { IProduct, Size } from "../../types/models.types";


const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String],default:[]},
    videos: { type: [String],default:[]},
    availability: { type: Boolean,default:true},
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    color: { type: String},
    sizes: { type: [String], enum: Object.values(Size),default:[Object.values(Size)]},
    brand: { type: String },
}, {
    timestamps: true
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product