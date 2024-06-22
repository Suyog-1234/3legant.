import mongoose, { Schema, model } from 'mongoose';
import { ICart } from '../../types/models.types';

const CartSchema = new Schema<ICart>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },    
    sessionId: {
        type: String,
        default:null
    },
    quantity: {
        type: Number,
        default:1,
        required: true
    }
},{timestamps:true});

const Cart = model<ICart>('Cart', CartSchema);
export default Cart;