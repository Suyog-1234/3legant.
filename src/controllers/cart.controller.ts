import { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../database/models/cart.model";

export async function getCart(req: Request, res: Response) {
    try {
        const { userId, sessionId } = req;
        let matchId: any = {};
        if (userId) {
            matchId = { userId: new mongoose.Types.ObjectId(userId) };
        } else if (sessionId) {
            matchId = { sessionId: sessionId };
        } else {
            return res.status(400).json({ message: "User ID or Session ID is required" });
        }
        const cartItems = await Cart.aggregate([
            { $match: matchId },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product",
                }
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "product.category",
                }
            },
            { $unwind: "$product.category" },
            {
                $addFields: {
                    totalPrice: { $multiply: ["$product.price", "$quantity"] }
                }
            },
            {
                $group: {
                    _id: null,
                    cartProducts: {
                        $push: {
                            _id: "$_id",
                            userId: "$userId",
                            productId: "$product._id",
                            name: "$product.name",
                            description: "$product.description",
                            price: "$product.price",
                            images: "$product.images",
                            videos: "$product.videos",
                            availability: "$product.availability",
                            category: "$product.category",
                            color: "$product.color",
                            sizes: "$product.sizes",
                            brand: "$product.brand",
                            quantity: "$quantity",
                            totalPrice: "$totalPrice"
                        }
                    },
                    cartTotal: { $sum: "$totalPrice" },
                    cartSize: { $sum: "$quantity" },
                }
            },
            {
                $project: {
                    _id: 0,
                    cartProducts: 1,
                    cartTotal: 1,
                    cartSize: 1
                }
            }
        ]);

        return res.status(200).json({ data: cartItems[0] || { cartProducts: [], cartTotal: 0 } });
    } catch (error) {
        console.error("Error retrieving cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function addToCart(req: Request, res: Response) {
    try {
        const { userId, sessionId } = req;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        let matchId: any = {};
        if (userId) {
            matchId = { userId: new mongoose.Types.ObjectId(userId) };
        } else if (sessionId) {
            matchId = { sessionId: sessionId };
        } else {
            return res.status(400).json({ message: "User ID or Session ID is required" });
        }

        const existingCartItem = await Cart.findOne({ ...matchId, productId: new mongoose.Types.ObjectId(productId) });
        if (existingCartItem) {
            existingCartItem.quantity += 1;
            await existingCartItem.save();
            return res.status(200).json({ message: "Product was already in the cart, quantity increased by one", data: existingCartItem });
        } else {
            const newCartItem = new Cart({
                ...matchId,
                productId: new mongoose.Types.ObjectId(productId),
                quantity: 1
            });
            await newCartItem.save();
            return res.status(200).json({ message: "Product has been added to cart", data: newCartItem });
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function removeFromCart(req: Request, res: Response) {
    try {
        const { userId, sessionId } = req;
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product ID" });
        }

        let matchId: any = {};
        if (userId) {
            matchId = { userId: new mongoose.Types.ObjectId(userId) };
        } else if (sessionId) {
            matchId = { sessionId: sessionId };
        } else {
            return res.status(400).json({ message: "User ID or Session ID is required" });
        }

        const deletedCartItem = await Cart.deleteOne({ _id: new mongoose.Types.ObjectId(productId), ...matchId });
        if (deletedCartItem.deletedCount === 0) {
            return res.status(404).json({ message: "Product not found in the cart" });
        }

        return res.status(200).json({ message: "Product has been removed from cart" });
    } catch (error) {
        console.error("Error removing from cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function manageCartQuantity(req: Request, res: Response) {
    try {
        const { userId, sessionId } = req;
        const { cartItemId, event } = req.body;

        if (!cartItemId) {
            return res.status(400).json({ message: "Cart item ID is required" });
        }

        if (!["INC", "DEC"].includes(event)) {
            return res.status(400).json({ message: "Event must be 'INC' or 'DEC'" });
        }

        let matchCriteria: any = {};
        if (userId) {
            matchCriteria = { userId: new mongoose.Types.ObjectId(userId) };
        } else if (sessionId) {
            matchCriteria = { sessionId: sessionId };
        } else {
            return res.status(400).json({ message: "User ID or Session ID is required" });
        }
        const cartItem = await Cart.findOne({ ...matchCriteria, _id: new mongoose.Types.ObjectId(cartItemId) });
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        if (event === "INC") {
            cartItem.quantity += 1;
            await cartItem.save();
            return res.status(200).json({ message: "Quantity has been incremented", data: cartItem });
        } else if (event === "DEC") {
            if (cartItem.quantity === 1) {
                await Cart.deleteOne({ ...matchCriteria, _id: new mongoose.Types.ObjectId(cartItemId) });
                return res.status(200).json({ message: "Product has been removed from the cart" });
            } else {
                cartItem.quantity -= 1;
                await cartItem.save();
                return res.status(200).json({ message: "Quantity has been decremented", data: cartItem });
            }
        }
    } catch (error) {
        console.error("Error managing cart quantity:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function mergeAnonymousCartIntoUserCart(req: Request, res: Response) {
    try {
        const { userId, sessionId } = req;
        console.log(userId,sessionId)
        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }
        const existingCarts = await Cart.find({ sessionId });
        if (existingCarts.length === 0) {
            return res.status(404).json({ message: "No cart found for the provided session ID" });
        }
        await Cart.updateMany(
            { sessionId },
            { userId: new mongoose.Types.ObjectId(userId), sessionId:null}
        );
        return res.status(200).json({ message: "Cart successfully merged" });
    } catch (error) {
        console.error("Error merging anonymous cart into user cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}