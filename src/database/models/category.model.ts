import { Schema, model, Document } from 'mongoose';
import { ICategory } from '../../types/models.types';

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

const Category = model<ICategory>('Category', categorySchema);

export default Category;
