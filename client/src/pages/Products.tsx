/* eslint-disable no-unused-vars */
// import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from 'react-router-dom';
import Row from '../ui/Row';
import useCurrentUser from '../hooks/useCurrentUser';
import { useState, ChangeEvent } from 'react';
import Spinner from '../ui/Spinner';
import useProductsCache from '../hooks/useProductsCache';
import Image from '../components/Image';
import {
  Section,
  ProductGrid,
  ProductLink,
  Product,
  CategoryLink,
  ClearLink,
  FavoriteIcon,
  SearchInput,
} from '../styles/ProductStyles';
import { Product as ProductType } from '../types/product';
import { User } from '../types/user';

const Products = () => {
  const { products, isFetchingProducts } = useProductsCache() as unknown as {
    products: ProductType[];
    isFetchingProducts: boolean;
    isProductsLoading: boolean;
    isProductsFetching: boolean;
  };
  const currentUser = useCurrentUser() as User | null;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  if (isFetchingProducts) {
    return <Spinner />;
  }

  const categoryFilter = searchParams.get('category');
  //creating unique categories array to display
  const categories = Array.from(
    new Set(products.map((product) => product.category.name))
  );

  const categoriesElement = categories.map((category) => (
    <CategoryLink
      to="#"
      onClick={(e) => {
        e.preventDefault();
        setSearchParams({ category });
      }}
      key={category}
      className={categoryFilter === category ? 'selected' : ''}
    >
      {category}
    </CategoryLink>
  ));

  // Filter products by category first
  let filteredProducts = categoryFilter
    ? products.filter((product) => product.category.name === categoryFilter)
    : products;

  // Then filter by search term
  filteredProducts = filteredProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productsElement = filteredProducts.map((product) => (
    <ProductLink
      to={`/products/${product.slug}`}
      key={product._id}
      state={{ filter: categoryFilter }}
    >
      <Product
        $itemsInStock={product.itemsInStock}
        className={
          currentUser?.favorites?.includes(product._id) ? 'favorite' : ''
        }
      >
        <Image src={product.image} alt={product.name} />
        {currentUser?.favorites?.includes(product._id) && <FavoriteIcon />}
        <p>{product.brand}</p>
        <h2>{product.name}</h2>
        <p className="price">${product.price}</p>
        <p className="description">
          {product.description
            ? product.description.split(' ').slice(0, 20).join(' ') + '...'
            : 'No description available.'}
        </p>
        {product.favoritedBy && product.favoritedBy.length > 0 && (
          <p className="likes">
            {product.favoritedBy.length}
            {product.favoritedBy.length === 1 ? ' user likes ' : ' users like '}
            this product
          </p>
        )}
        <p className="stock">
          {product.itemsInStock > 0
            ? `${product.itemsInStock} in stock`
            : 'Out of stock'}
        </p>
      </Product>
    </ProductLink>
  ));

  return (
    <Section data-testid="products-page">
      <SearchInput
        type="text"
        id="product-search"
        name="product-search"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
      />

      <Row type="horizontal">{categoriesElement}</Row>
      {categoryFilter && (
        <Row>
          <ClearLink onClick={() => setSearchParams({})}>
            Clear filters
          </ClearLink>
        </Row>
      )}

      <ProductGrid>{productsElement}</ProductGrid>
    </Section>
  );
};

export default Products;
