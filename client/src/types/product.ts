import { Category } from './category';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  itemsInStock: number;
  category: {
    id: string;
    name: string;
  };
  image: string;
  imagePublicId: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  favoritedBy?: string[];
  slug: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  itemsInStock: number;
  category: {
    name: string;
    id: string;
  };
  image: FileList;
  brand: string;
}

export interface DeleteProductResponse {
  products: Product[];
  categories: Category[];
}

export interface UpdateProductData {
  price?: number;
  itemsInStock?: number;
  image?: FileList;
}
