import useOrdersQuery from '../../hooks/useOrdersQuery';
import {
  OrdersContainer,
  OrdersHeader,
  OrdersGrid,
  OrderCard,
  OrderHeader,
  OrderInfo,
  OrderStatus,
  OrderItems,
  OrderItem,
  ItemDetails,
  OrderTotal,
  EmptyMessage,
} from '../../styles/ManageOrdersStyles';
import Spinner from '../../ui/Spinner';
import { formatDate } from '../../utils/helpers';
import { OrderItem as OrderItemType } from '../../types/order';

const ManageOrders = () => {
  const { orders: rawOrders, isOrdersLoading } = useOrdersQuery();
  const orders = rawOrders;

  if (isOrdersLoading) return <Spinner />;

  // Handle no orders case
  if (!orders?.length) {
    return (
      <OrdersContainer data-testid="manage-orders-page">
        <OrdersHeader>All Orders</OrdersHeader>
        <EmptyMessage>No orders found in the database</EmptyMessage>
      </OrdersContainer>
    );
  }

  const renderOrderItems = (items: OrderItemType[]) => {
    return items.map((item) => (
      <OrderItem key={item.productId}>
        {item.image ? <img src={item.image} alt={item.productName} /> : null}
        <ItemDetails>
          <h4>{item.productName}</h4>
          <p>Quantity: {item.quantity}</p>
          <p className="price">${item.price}</p>
        </ItemDetails>
      </OrderItem>
    ));
  };

  const renderOrders = orders.map((order) => (
    <OrderCard key={order._id}>
      <OrderHeader>
        <OrderInfo className="order-id">Order ID: {order._id}</OrderInfo>

        <OrderInfo>User ID: {order.user}</OrderInfo>
        <OrderInfo className="order-date">
          Date: {formatDate(order.createdAt)}
        </OrderInfo>
        <OrderStatus $status={order.status}>
          {order.status.toUpperCase()}
        </OrderStatus>
      </OrderHeader>

      <OrderItems>{renderOrderItems(order.orderItems)}</OrderItems>

      <OrderTotal>Total: ${order.totalPrice}</OrderTotal>
    </OrderCard>
  ));

  return (
    <OrdersContainer>
      <OrdersHeader>All Orders</OrdersHeader>
      <OrdersGrid>{renderOrders}</OrdersGrid>
    </OrdersContainer>
  );
};

export default ManageOrders;
