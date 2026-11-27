/**
 * Petalio Blossom - REST API Client
 * Communicates with the Node.js Express backend on port 5001
 */

const API_BASE = 'http://localhost:5001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('petalio_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // ─── Authentication ──────────────────────────────────────────
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('petalio_token', data.token);
      localStorage.setItem('petalio_user', JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('petalio_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout: () => {
    localStorage.removeItem('petalio_token');
    localStorage.removeItem('petalio_user');
  },

  // ─── Flowers Catalogue ───────────────────────────────────────
  getFlowers: async () => {
    try {
      const res = await fetch(`${API_BASE}/flowers`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch flowers:', err);
      return { success: false, data: [] };
    }
  },

  createFlower: async (flowerData) => {
    const res = await fetch(`${API_BASE}/flowers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(flowerData)
    });
    return await res.json();
  },

  updateFlower: async (id, flowerData) => {
    const res = await fetch(`${API_BASE}/flowers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(flowerData)
    });
    return await res.json();
  },

  deleteFlower: async (id) => {
    const res = await fetch(`${API_BASE}/flowers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  // ─── Inventory Management ────────────────────────────────────
  getInventory: async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      return { success: false, data: [] };
    }
  },

  updateInventory: async (flowerId, stockQuantity, reorderLevel) => {
    const res = await fetch(`${API_BASE}/inventory/${flowerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stock_quantity: stockQuantity, reorder_level: reorderLevel })
    });
    return await res.json();
  },

  // ─── Orders Management ───────────────────────────────────────
  getOrders: async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      return { success: false, data: [] };
    }
  },

  createOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return await res.json();
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  // ─── Deliveries Management ────────────────────────────────────
  getDeliveries: async () => {
    try {
      const res = await fetch(`${API_BASE}/deliveries`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
      return { success: false, data: [] };
    }
  },

  createDelivery: async (deliveryData) => {
    const res = await fetch(`${API_BASE}/deliveries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(deliveryData)
    });
    return await res.json();
  },

  updateDeliveryStatus: async (deliveryId, status) => {
    const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  // ─── Invoices Management ──────────────────────────────────────
  getInvoices: async () => {
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      return { success: false, data: [] };
    }
  },

  createInvoice: async (invoiceData) => {
    const res = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(invoiceData)
    });
    return await res.json();
  },

  updateInvoiceStatus: async (invoiceId, status) => {
    const res = await fetch(`${API_BASE}/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  // ─── Suppliers Management ─────────────────────────────────────
  getSuppliers: async () => {
    try {
      const res = await fetch(`${API_BASE}/suppliers`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
      return { success: false, data: [] };
    }
  },

  createSupplier: async (supplierData) => {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(supplierData)
    });
    return await res.json();
  },

  updateSupplierApproval: async (supplierId, isApproved) => {
    const res = await fetch(`${API_BASE}/suppliers/${supplierId}/approval`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_approved: isApproved })
    });
    return await res.json();
  },

  // ─── Users & Supplier Approvals ──────────────────────────────
  getUsers: async (role = '', status = '') => {
    try {
      let url = `${API_BASE}/users`;
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (status) params.append('status', status);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch users:', err);
      return { success: false, data: [] };
    }
  },

  updateUserStatus: async (userId, status) => {
    const res = await fetch(`${API_BASE}/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  // ─── Supplier Capacity ───────────────────────────────────────
  getSupplierCapacities: async () => {
    try {
      const res = await fetch(`${API_BASE}/supplier-capacity`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch supplier capacity:', err);
      return { success: false, data: [] };
    }
  },

  createSupplierCapacity: async (data) => {
    const res = await fetch(`${API_BASE}/supplier-capacity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // ─── ML Demand Forecasting ───────────────────────────────────
  predictDemand: async (params) => {
    try {
      const res = await fetch(`${API_BASE}/forecasts/predict`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to get ML forecast:', err);
      return { success: false, message: err.message };
    }
  },

  getForecasts: async () => {
    try {
      const res = await fetch(`${API_BASE}/forecasts`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch saved forecasts:', err);
      return { success: false, data: [] };
    }
  },

  saveForecast: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/forecasts/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to save forecast:', err);
      return { success: false, message: err.message };
    }
  }
};

