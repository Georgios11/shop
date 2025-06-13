import { useSearchParams } from 'react-router-dom';
import Image from '../../components/Image';
import Spinner from '../../ui/Spinner';
import useProductsCache from '../../hooks/useProductsCache';
import Row from '../../ui/Row';
import {
  Section,
  ProductGrid,
  ProductCard,
  ProductContent,
  CategoryLink,
  ClearLink,
} from '../../styles/ManageProductStyles';
import { Product } from '../../types/product';

const ManageProducts = () => {
  const { products, isProductsFetching } = useProductsCache();
  const [searchParams, setSearchParams] = useSearchParams();

  if (isProductsFetching) return <Spinner />;

  const categoryFilter = searchParams.get('category');
  const typedProducts = products;
  const categories = Array.from(
    new Set(typedProducts.map((product) => product.category.name))
  );

  const categoriesElement = categories.map((category: string) => (
    <CategoryLink
      to={`?category=${category}`}
      key={category}
      className={categoryFilter === category ? 'selected' : ''}
    >
      {category}
    </CategoryLink>
  ));

  const finalProducts = categoryFilter
    ? typedProducts.filter(
        (product) => product.category.name === categoryFilter
      )
    : typedProducts;

  const productElements = finalProducts.map((product: Product) => (
    <ProductCard
      to={`${product._id}`}
      key={product._id}
      state={{ filter: categoryFilter }}
    >
      <ProductContent $itemsInStock={product.itemsInStock}>
        <Image src={product.image} alt={product.name} />
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
            ❤️ {product.favoritedBy.length}
            {product.favoritedBy.length === 1 ? ' like' : ' likes'}
          </p>
        )}
        <p className="stock">
          {product.itemsInStock > 0
            ? `${product.itemsInStock} in stock`
            : 'Out of stock'}
        </p>
      </ProductContent>
    </ProductCard>
  ));

  return (
    <Section data-testid="manage-products-page">
      <Row type="horizontal">
        {categoriesElement}
        {categoryFilter && (
          <ClearLink onClick={() => setSearchParams({})}>
            Clear filters
          </ClearLink>
        )}
      </Row>
      <ProductGrid>{productElements}</ProductGrid>
    </Section>
  );
};

export default ManageProducts;
