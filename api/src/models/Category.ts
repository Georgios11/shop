import mongoose, { Document } from 'mongoose';

export type CategoryDocument = Document & {
  name: string;
  slug: string;
  createdBy: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  is_discounted: boolean;
  _id: mongoose.Types.ObjectId | null;
};
const categorySchema = new mongoose.Schema<CategoryDocument>(
  {
    name: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      minlength: [4, 'Minimum category name length is 4 characters'],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    is_discounted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<CategoryDocument>('Category', categorySchema);
