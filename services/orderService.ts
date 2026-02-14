
import { OrderData, OrderStatus } from '../types';
import { firebaseService } from './firebaseService';

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
    
    // Save locally for offline fallback
    orders.push(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    
    // Push to Cloud (Pre-configured)
    firebaseService.pushOrder(newOrder).catch(err => {
      console.error("Cloud push failed, saved locally only:", err);
    });
    
    window.dispatchEvent(new Event('ordersUpdated'));
    return newOrder;
  },

  importOrder: (orderData: OrderData): void => {
    const orders = orderService.getOrders();
    if (!orders.find(o => o.id === orderData.id)) {
      orders.push({ ...orderData, read: false });
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      window.dispatchEvent(new Event('ordersUpdated'));
    }
  },

  updateOrderStatus: (orderId: string, status: OrderStatus): void => {
    const orders = orderService.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      
      // Update on cloud
      firebaseService.updateOrderStatus(orderId, status).catch(console.error);
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

  deleteOrder: (orderId: string): void => {
    const orders = orderService.getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(filtered));
    
    // Delete from cloud
    firebaseService.deleteOrder(orderId).catch(console.error);
  }
};
