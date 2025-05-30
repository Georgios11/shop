import useCurrentUser from '../../hooks/useCurrentUser';
import { useQueryClient } from '@tanstack/react-query';
import {
  OrdersContainer,
  OrdersHeader,
  OrdersList,
  OrderCard,
  OrderHeader,
  OrderItems,
  OrderItem,
  OrderTotal,
} from '../../styles/OrderStyles';
import { Order } from '../../types/order';

interface OrderItem {
  productId?: string;
  image: string;
  productName: string;
  quantity: number;
  price: number;
}

const Orders = () => {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const allOrders = queryClient.getQueryData<Order[]>(['orders']);
  const orders =
    allOrders?.filter((order) => order.user === currentUser?._id) || [];

  if (!orders || orders.length === 0) {
    return (
      <OrdersContainer>
        <OrdersHeader>No orders found</OrdersHeader>
      </OrdersContainer>
    );
  }

  const renderOrderItems = (
    item: OrderItem,
    order: Order,
    itemIndex: number
  ) => {
    return (
      <OrderItem
        key={
          item.productId
            ? `item_${item.productId}_${order._id}`
            : `temp_item_${itemIndex}`
        }
      >
        {item.image ? <img src={item.image} alt={item.productName} /> : null}
        <div className="item-details">
          <h4>{item.productName}</h4>
          <span className="quantity">Quantity: {item.quantity}</span>
        </div>
        <span className="price">${item.price.toFixed(2)}</span>
      </OrderItem>
    );
  };

  const renderOrders = orders.map((order, index) => (
    <OrderCard
      key={
        order._id
          ? `order_${order._id}_${order.createdAt}`
          : `temp_order_${index}`
      }
    >
      <OrderHeader>
        <span className="order-id">
          Order ID: {order._id || 'Processing...'}
        </span>
        <span className="order-date">
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : 'Just now'}
        </span>
      </OrderHeader>
      <OrderItems>
        {order.orderItems?.map((item, itemIndex) =>
          renderOrderItems(item, order, itemIndex)
        )}
      </OrderItems>
      <OrderTotal>
        Total: $
        {order.totalPrice
          ? (typeof order.totalPrice === 'string'
              ? Number(order.totalPrice)
              : order.totalPrice
            ).toFixed(2)
          : '0.00'}
      </OrderTotal>
    </OrderCard>
  ));

  return (
    <OrdersContainer data-testid="orders-page">
      <OrdersHeader>Your Orders</OrdersHeader>
      <OrdersList>{renderOrders}</OrdersList>
    </OrdersContainer>
  );
};

export default Orders;
