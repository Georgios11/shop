export interface Category {
  _id: string;
  name: string;
  slug: string;
  createdBy: string;
  products: string[];
  createdAt: string;
  updatedAt: string;
  is_discounted: boolean;
}

export interface CategoriesResponse {
  categories: Category[];
}
export interface DeleteCategoryResponse {
  categories: Category[];
  products: {
    _id: string;
    name: string;
    description: string;
    brand: string;
    price: number;
    itemsInStock: number;
    category: {
      name: string;
      id: string;
    };
    image: string;
    imagePublicId: string;
    createdAt: string;
    updatedAt: string;
  }[];
}
