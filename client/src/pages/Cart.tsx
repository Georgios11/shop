import { Link, useNavigate } from 'react-router-dom';
import {
  CartSection,
  CartContainer,
  CartItems,
  CartItem,
  ItemDetails,
  QuantityControls,
  CartSummary,
  SummaryItem,
  CheckoutButton,
  EmptyCart,
} from '../styles/CartStyles';
import useCurrentUser from '../hooks/useCurrentUser';
import useAddToCart from '../hooks/useAddToCart';
import useRemoveFromCart from '../hooks/useRemoveFromCart';
import usePlaceOrder from '../hooks/usePlaceOrder';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const Cart = () => {
  const currentUser = useCurrentUser();
  const cart = currentUser?.cart;
  const { addToCart } = useAddToCart();
  const { removeFromCart } = useRemoveFromCart();
  const { placeOrder, isLoading } = usePlaceOrder();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      void navigate('/');
    }
  }, [currentUser, navigate]);

  const handleIncreaseQuantity = async (productId: string) => {
    try {
      const data = await addToCart(productId);
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleDecreaseQuantity = async (productId: string) => {
    try {
      const data = await removeFromCart(productId);
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleCheckout = async () => {
    try {
      await placeOrder();
      toast.success('Order placed successfully!');
      void navigate('/user/orders');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyCart data-testid="empty-cart">
        <h2>Your cart is empty</h2>
        <Link to="/products">Continue Shopping</Link>
      </EmptyCart>
    );
  }

  const renderCartItems = cart.items.map((item) => (
    <CartItem key={item.productId}>
      <img src={item.image} alt={item.productName} />
      <ItemDetails>
        <h3>{item.productName}</h3>
        <p className="price">${item.price.toFixed(2)}</p>
        <QuantityControls>
          <button onClick={() => void handleDecreaseQuantity(item.productId)}>
            -
          </button>
          <span>{item.quantity}</span>
          <button onClick={() => void handleIncreaseQuantity(item.productId)}>
            +
          </button>
        </QuantityControls>
      </ItemDetails>
    </CartItem>
  ));

  return (
    <CartSection data-testid="cart-page">
      <h1>Shopping Cart</h1>
      <CartContainer>
        <CartItems>{renderCartItems}</CartItems>

        <CartSummary>
          <h2>Order Summary</h2>
          <SummaryItem>
            <span>Subtotal:</span>
            <span>
              ${(cart?.totalPrice ? Number(cart.totalPrice) : 0).toFixed(2)}
            </span>
          </SummaryItem>
          <SummaryItem>
            <span>Shipping:</span>
            <span>Free</span>
          </SummaryItem>
          <SummaryItem className="total">
            <span>Total:</span>
            <span>
              ${(cart?.totalPrice ? Number(cart.totalPrice) : 0).toFixed(2)}
            </span>
          </SummaryItem>
          <CheckoutButton
            onClick={() => void handleCheckout()}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Proceed to Checkout'}
          </CheckoutButton>
        </CartSummary>
      </CartContainer>
    </CartSection>
  );
};

export default Cart;
