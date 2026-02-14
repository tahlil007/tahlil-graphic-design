
import { OrderData, OrderStatus } from '../types';

const ORDERS_KEY = 'design_gold_orders';

export const orderService = {
  getOrders: (): OrderData[] => {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveOrder: (order: Omit<OrderData, 'id' | 'createdAt' | 'status' | 'read'>): OrderData => {
    const orders = orderService.getOrders();
    const newOrder: OrderData = {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      status: OrderStatus.New,
      read: false
    };
    orders.push(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return newOrder;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus): void => {
    const orders = orderService.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  },

  markAsRead: (orderId: string): void => {
    const orders = orderService.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].read = true;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  },

  markAllAsRead: (): void => {
    const orders = orderService.getOrders();
    orders.forEach(o => o.read = true);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  deleteOrder: (orderId: string): void => {
    const orders = orderService.getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(filtered));
  }
};
