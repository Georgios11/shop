import Category, { CategoryDocument } from '../models/Category';
import Product, { ProductDocument } from '../models/Product';

const getAllProducts = async (): Promise<ProductDocument[]> => {
  return Product.find();
};

const getAllCategories = async (): Promise<CategoryDocument[]> => {
  return Category.find();
};

export default {
  getAllProducts,

  getAllCategories,
};
