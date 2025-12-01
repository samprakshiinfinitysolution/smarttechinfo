const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  // Auth
  adminLogin: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  userLogin: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  userRegister: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  },

  // User Bookings
  getMyBookings: async (token: string) => {
    const res = await fetch(`${API_URL}/bookings/my-bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.status === 403 && data.deactivated) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?deactivated=true';
      throw new Error('Account deactivated');
    }
    return data;
  },

  updateBooking: async (token: string, bookingId: string, data: any) => {
    const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateProfile: async (token: string, data: any) => {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.status === 403 && result.deactivated) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?deactivated=true';
      throw new Error('Account deactivated');
    }
    return result;
  },

  createBooking: async (token: string, bookingData: any) => {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    const data = await res.json();
    if (res.status === 403 && data.deactivated) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?deactivated=true';
      throw new Error('Account deactivated');
    }
    return data;
  },

  // Admin
  getAdminStats: async (token: string) => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getDashboardStats: async (token: string) => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getAllBookings: async (token: string) => {
    const res = await fetch(`${API_URL}/admin/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getAllUsers: async (token: string) => {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('API getAllUsers response:', data);
    return data;
  },

  getUser: async (token: string, userId: string) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  adminUpdateUser: async (token: string, userId: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  adminDeleteUser: async (token: string, userId: string) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getAllTechnicians: async (token: string) => {
    const res = await fetch(`${API_URL}/admin/technicians`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.technicians || data;
  },

  updateBookingStatus: async (token: string, id: string, status: string) => {
    const res = await fetch(`${API_URL}/admin/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  adminUpdateBooking: async (token: string, id: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/bookings/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  adminDeleteBooking: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/admin/bookings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  createTechnician: async (token: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/technicians`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateTechnician: async (token: string, id: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/technicians/${id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteTechnician: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/admin/technicians/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  updateUserStatus: async (token: string, id: string, status: string) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  deleteUser: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  createUser: async (token: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  adminCreateBooking: async (token: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/bookings`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getTechnicianBookings: async (token: string, technicianId: string) => {
    const res = await fetch(`${API_URL}/admin/technicians/${technicianId}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.bookings || data;
  }
};
