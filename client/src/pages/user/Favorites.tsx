import useCurrentUser from '../../hooks/useCurrentUser';
import useProductsCache from '../../hooks/useProductsCache';
import { Section, ProductGrid, Product } from '../../styles/ProductStyles';
import { FaTrash } from 'react-icons/fa';
import styled from 'styled-components';
import useRemoveFavorite from '../../hooks/useRemoveFavorite';
import Heading from '../../ui/Heading';
import { toast } from 'react-hot-toast';
import { Product as ProductType } from '../../types/product';

const Favorites = () => {
  const currentUser = useCurrentUser();
  const { products, isProductsLoading } = useProductsCache();
  const { removeFavorite, isRemovingFavorite } = useRemoveFavorite();
  const favorites = currentUser?.favorites || [];

  // Wait for products to load
  if (isProductsLoading) return <div>Loading...</div>;

  const favoriteProducts = products.filter((product) =>
    favorites.includes(product._id)
  );

  const handleRemoveFavorite = async (productId: string) => {
    try {
      const response = await removeFavorite(productId);
      toast.success(response.message);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to remove favorite');
    }
  };

  return (
    <Section data-testid="user-favorites-page">
      <Heading as="h2">User Favorites</Heading>
      <ProductGrid>
        {favoriteProducts.map((product: ProductType) => (
          <Product key={product._id} $itemsInStock={product.itemsInStock}>
            <img src={product.image} alt={product.name} />
            <h2>{product.name}</h2>
            <PriceRow>
              <p className="price">${product.price}</p>
              <HeartButton
                onClick={() => void handleRemoveFavorite(product._id)}
                disabled={isRemovingFavorite}
              >
                <FaTrash />
              </HeartButton>
            </PriceRow>
          </Product>
        ))}
      </ProductGrid>
      {favoriteProducts.length === 0 && (
        <Heading>No favorites yet! Browse products to add some.</Heading>
      )}
    </Section>
  );
};

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: auto;
`;

const HeartButton = styled.button`
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export default Favorites;
