import mongoose, { Document, Types } from "mongoose";

export interface ICategory extends Document {
    name: string;
}
export enum Size {
    SM = 'SM',
    MD = 'MD',
    LG = 'LG',
    XL = 'XL'
}
export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    images?: string[];
    videos?: string[];
    availability?: boolean;
    category: mongoose.Types.ObjectId;
    color?: string;
    sizes?: Size[];
    brand?: string;
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    profileImage?: string;
}

export interface ICart extends Document {
    userId: Types.ObjectId;
    sessionId?:string;
    productId?:string;
    quantity:number
}
