import { Request, Response } from "express";
import z from "zod";
import Category from "../database/models/category.model";
import mongoose from "mongoose";

export const createCategoryValidation = z.object({
  name: z.string({ required_error: "Category name is required" }).min(1),
});

export const updateCategoryValidation = z.object({
  id: z.string({ required_error: "Category ID is required" }).refine(value => /^[0-9a-fA-F]{24}$/.test(value), {
    message: "Invalid category ID format"
  }),
  name: z.string({ required_error: "Category name is required" }).min(1),
});

export const deleteCategoryValidation = z.object({
  id: z.string({ required_error: "Category ID is required" }).refine(value => /^[0-9a-fA-F]{24}$/.test(value), {
    message: "Invalid category ID format"
  }),
});

export async function createCategory(req: Request, res: Response) {
  try {
    const parsedReqBody = createCategoryValidation.parse(req.body);
    const { name } = parsedReqBody;
    const existingCategory = await Category.findOne({ name }).lean().exec();
    if (existingCategory) {
      return res.status(400).json({ message: "Category with the same name already exists" });
    }
    const createdCategory = await Category.create({ name });
    if (!createdCategory) {
      return res.status(400).json({ message: "Failed to create category" });
    }
    return res.status(201).json({ message: "Category created successfully", data: createdCategory });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    console.error("Error creating category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const parsedReqBody = updateCategoryValidation.parse(req.body);
    const { id, name } = parsedReqBody;
    const existingCategory = await Category.findById(id).lean().exec();
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    const updatedCategory = await Category.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { name });

    if (updatedCategory.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to update category" });
    }

    return res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    console.error("Error updating category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const parsedReqBody = deleteCategoryValidation.parse(req.params);

    const { id } = parsedReqBody;

    const existingCategory = await Category.findById(id).lean().exec();

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const deletedCategory = await Category.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    if (deletedCategory.deletedCount === 0) {
      return res.status(400).json({ message: "Failed to delete category" });
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    console.error("Error deleting category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllCategories(req: Request, res: Response) {
  try {
      const categories = await Category.find().lean().exec();
      return res.status(200).json({data:categories});
  } catch (error) {
      if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.issues[0].message });
      }
      return res.status(500).json({ message: "Internal server error" });
  }
}