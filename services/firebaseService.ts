
import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase, ref, set, push, onValue, update, remove } from "firebase/database";
import { OrderData, Project } from "../types";

const CLOUD_CONFIG_KEY = 'design_gold_firebase_config';

// User provided credentials
const DEFAULT_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyAphXhHL5_pRYjgDEYfArMX0vp9SIMFqQo",
  authDomain: "graohics-designer-default-rtdb.firebaseapp.com",
  databaseURL: "https://graohics-designer-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "graohics-designer-default-rtdb",
  storageBucket: "graohics-designer-default-rtdb.appspot.com",
  messagingSenderId: "",
  appId: ""
};

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseService = {
  getConfig: (): FirebaseConfig => {
    const saved = localStorage.getItem(CLOUD_CONFIG_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  },

  saveConfig: (config: FirebaseConfig) => {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
    window.location.reload(); 
  },

  isConfigured: (): boolean => {
    // Since we now have a DEFAULT_CONFIG, it's always "configured"
    return true;
  },

  init: () => {
    const config = firebaseService.getConfig();
    try {
      return getApps().length === 0 ? initializeApp(config) : getApp();
    } catch (e) {
      console.error("Firebase init failed:", e);
      return null;
    }
  },

  // Orders Synchronization
  syncOrders: (callback: (orders: OrderData[]) => void) => {
    const app = firebaseService.init();
    if (!app) return;
    const db = getDatabase(app);
    const ordersRef = ref(db, 'orders');
    
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key 
        }));
        callback(ordersArray);
      } else {
        callback([]);
      }
    });
  },

  pushOrder: async (order: OrderData) => {
    const app = firebaseService.init();
    if (!app) return;
    const db = getDatabase(app);
    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    await set(newOrderRef, order);
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const app = firebaseService.init();
    if (!app) return;
    const db = getDatabase(app);
    const ordersRef = ref(db, 'orders');
    
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const key = Object.keys(data).find(k => data[k].id === orderId);
        if (key) {
          update(ref(db, `orders/${key}`), { status });
        }
      }
    }, { onlyOnce: true });
  },

  deleteOrder: async (orderId: string) => {
    const app = firebaseService.init();
    if (!app) return;
    const db = getDatabase(app);
    const ordersRef = ref(db, 'orders');
    
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const key = Object.keys(data).find(k => data[k].id === orderId);
        if (key) {
          remove(ref(db, `orders/${key}`));
        }
      }
    }, { onlyOnce: true });
  }
};
