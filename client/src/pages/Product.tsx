import { useLocation, useParams } from 'react-router-dom';
import useProductsCache from '../hooks/useProductsCache';
import useAddFavorite from '../hooks/useAddFavorite';
import useRemoveFavorite from '../hooks/useRemoveFavorite';
import Heading from '../ui/Heading';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  ProductContainer,
  ProductImage,
  ProductDetails,
  ProductTitle,
  ProductDescription,
  ProductPrice,
  ProductStock,
  BackLink,
  ActionButtons,
  ActionButton,
} from '../styles/ProductDetailsStyles';
import { Section } from '../styles/ProductStyles';
import useAddToCart from '../hooks/useAddToCart';
import useCurrentUser from '../hooks/useCurrentUser';
import useWindowWidth from '../hooks/useWindowWidth';

interface LocationState {
  filter?: string;
}

const SingleProduct = () => {
  const currentUser = useCurrentUser();

  const { slug } = useParams<{ slug: string }>();
  const { products } = useProductsCache();
  const { addFavorite, isAddingFavorite } = useAddFavorite();
  const { removeFavorite, isRemovingFavorite } = useRemoveFavorite();
  const location = useLocation();
  const product = products.find((product) => product.slug === slug);
  const { addToCart, isAddingToCart } = useAddToCart();
  const windowWidth = useWindowWidth();

  const isFavorited = product?._id
    ? currentUser?.favorites?.includes(product._id)
    : false;
  const isLoading = isAddingFavorite || isRemovingFavorite;

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited && product?._id) {
        const data = await removeFavorite(product._id);
        toast.success(data.message);
      } else if (product?._id) {
        const data = await addFavorite(product._id);
        toast.success(data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred');
      }
    }
  };

  const handleAddToCart = async () => {
    try {
      if (product?._id) {
        const data = await addToCart(product._id);
        toast.success(data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred');
      }
    }
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  const filter = (location.state as LocationState)?.filter || '';

  return (
    <Section data-testid="product-page">
      <BackLink to={filter ? `..?category=${filter}` : '..'} relative="path">
        <Heading as="h3">
          back to {filter ? `${filter} products` : 'all products'}
        </Heading>
      </BackLink>
      <ProductContainer $windowWidth={windowWidth}>
        <ProductImage src={product.image} alt={product.name} />
        <ProductDetails>
          <ProductTitle>{product.name}</ProductTitle>
          <p>Brand: {product.brand}</p>
          <ProductDescription>{product.description}</ProductDescription>
          <ProductPrice>${product.price}</ProductPrice>
          <div className="stock-actions">
            <ProductStock $inStock={product.itemsInStock}>
              {product.itemsInStock > 0
                ? `${product.itemsInStock} in stock`
                : 'Out of stock'}
            </ProductStock>
            {product.favoritedBy && product.favoritedBy.length > 0 && (
              <p className="likes">
                ❤️ {product.favoritedBy.length}
                {product.favoritedBy.length === 1 ? ' like' : ' likes'}
              </p>
            )}
            <ActionButtons>
              <ActionButton
                onClick={() => void handleAddToCart()}
                disabled={isAddingToCart}
              >
                <FaShoppingCart />
              </ActionButton>
              <ActionButton
                onClick={() => void handleToggleFavorite()}
                disabled={isLoading}
                $isFavorited={isFavorited}
              >
                {isFavorited ? <FaHeart /> : <FaRegHeart />}
              </ActionButton>
            </ActionButtons>
          </div>
        </ProductDetails>
      </ProductContainer>
    </Section>
  );
};

export default SingleProduct;
