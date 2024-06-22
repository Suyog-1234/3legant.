import { Request, Response } from "express";
import { z } from "zod";
import Product from "../database/models/product.model";
import mongoose from "mongoose";

const SizeEnum = z.enum(['SM', 'MD', 'LG', 'XL']);

const createProductValidation = z.object({
    name: z.string({ required_error: "Product name is required" }).min(1),
    description: z.string({ required_error: "Product description is required" }).min(1),
    price: z.number({ required_error: "Price is required" }),
    images: z.array(z.string().url()).optional(),
    videos: z.array(z.string().url()).optional(),
    availability: z.boolean().optional(),
    category: z.string({ required_error: "Category ID is required" }).refine(value => /^[0-9a-fA-F]{24}$/.test(value), {
        message: "Invalid category ID format"
    }),
    color: z.string().optional(),
    sizes: z.array(SizeEnum).optional(),
    brand: z.string().optional()
});

const updateProductValidation = createProductValidation.extend({
    id: z.string({ required_error: "Product ID is required" }).refine(value => /^[0-9a-fA-F]{24}$/.test(value), {
        message: "Invalid product ID format"
    })
});

const deleteProductValidation = z.object({
    id: z.string({ required_error: "Product ID is required" }).refine(value => /^[0-9a-fA-F]{24}$/.test(value), {
        message: "Invalid product ID format"
    })
});

export async function createProduct(req: Request, res: Response) {
    try {
        const parsedReqBody = createProductValidation.parse(req.body);

        const createdProduct = await Product.create(parsedReqBody);

        if (!createdProduct) {
            return res.status(400).json({ message: "Failed to create product" });
        }

        return res.status(201).json({ message: "Product created successfully", data: createdProduct });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues[0].message });
        }
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateProduct(req: Request, res: Response) {
    try {
        const parsedReqBody = updateProductValidation.parse(req.body);

        const existingProduct = await Product.findById(parsedReqBody.id).lean().exec();
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const updatedProduct = await Product.updateOne(
            { _id: new mongoose.Types.ObjectId(parsedReqBody.id) },
            parsedReqBody
        );

        if (updatedProduct.modifiedCount === 0) {
            return res.status(400).json({ message: "Failed to update product" });
        }

        return res.status(200).json({ message: "Product updated successfully"});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues[0].message });
        }
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteProduct(req: Request, res: Response) {
    try {
        const parsedReqBody = deleteProductValidation.parse(req.params);

        const existingProduct = await Product.findById(parsedReqBody.id).lean().exec();
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const deletedProduct = await Product.deleteOne({ _id: new mongoose.Types.ObjectId(parsedReqBody.id) });

        if (deletedProduct.deletedCount === 0) {
            return res.status(400).json({ message: "Failed to delete product" });
        }

        return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues[0].message });
        }
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export async function getProduct(req: Request, res: Response) {
    try {
        const parsedReqBody = deleteProductValidation.parse(req.params);
        const existingProduct = await Product.findById(parsedReqBody.id).lean().exec();
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({data:existingProduct});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues[0].message });
        }
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getAllProduct(req: Request, res: Response) {
    try {
        const products = await Product.find().lean().exec();
        return res.status(200).json({data:products});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues[0].message });
        }
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}