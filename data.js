// ═══════════════════════════════════════
//  BLUME RESTAURANT — FRONTEND DATA & API
// ═══════════════════════════════════════

const API_BASE = 'https://blume-backend--smuqaddas763.replit.app';
// ═══════════════════════════════════════
//  MENU ITEMS (fallback only)
// ═══════════════════════════════════════
const MENU_ITEMS = [
  {
    id: 'seared-scallops', cat: 'starter', tag: 'Starter',
    name: 'Seared Scallops',
    img: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&q=80',
    price: 28,
    desc: 'Pan-seared scallops with lemon beurre blanc.'
  }
];

// ═══════════════════════════════════════
//  API HELPER
// ═══════════════════════════════════════
const API = {
  async request(endpoint, method = 'GET', body = null) {
    try {
      const token = localStorage.getItem('blume_token');
      const res = await fetch(API_BASE + endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: 'Bearer ' + token })
        },
        body: body ? JSON.stringify(body) : null
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API Error');
      return data;
    } catch (err) {
      console.error('API Error:', err.message);
      throw err;
    }
  },

  register: (data)          => API.request('/api/auth/register', 'POST', data),
  login:    (email, password)=> API.request('/api/auth/login', 'POST', { email, password }),
  getMe:    ()               => API.request('/api/auth/me'),

  getMenu:     (cat = 'all') => API.request('/api/menu' + (cat === 'all' ? '' : '?cat=' + cat)),
  getMenuItem: (id)          => API.request('/api/menu/' + id),

  placeOrder:       (data) => API.request('/api/orders', 'POST', data),
  getMyOrders:      ()     => API.request('/api/orders/my'),

  makeReservation:  (data) => API.request('/api/reservations', 'POST', data),
  getMyReservations:()     => API.request('/api/reservations/my'),
};

// ═══════════════════════════════════════
//  CART
// ═══════════════════════════════════════
const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem('blume_cart') || '[]'); }
    catch { return []; }
  },

  save(cart) {
    localStorage.setItem('blume_cart', JSON.stringify(cart));
    Cart.updateBadge();
  },

  add(id, qty = 1) {
    const cart = Cart.get();
    const item = cart.find(i => i.id === id);
    if (item) item.qty += qty;
    else cart.push({ id, qty });
    Cart.save(cart);
  },

  remove(id) { Cart.save(Cart.get().filter(i => i.id !== id)); },

  update(id, qty) {
    if (qty < 1) { Cart.remove(id); return; }
    const cart = Cart.get();
    const item = cart.find(i => i.id === id);
    if (item) item.qty = qty;
    Cart.save(cart);
  },

  clear() {
    localStorage.removeItem('blume_cart');
    Cart.updateBadge();
  },

  count() { return Cart.get().reduce((s, i) => s + i.qty, 0); },

  total() {
    return Cart.get().reduce((sum, i) => {
      const item = MENU_ITEMS.find(m => m.id === i.id);
      return sum + (item ? item.price * i.qty : 0);
    }, 0);
  },

  updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(b => {
      const c = Cart.count();
      b.textContent  = c;
      b.style.display = c > 0 ? 'flex' : 'none';
    });
  }
};

// ═══════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════
const Auth = {
  get() {
    try { return JSON.parse(localStorage.getItem('blume_user') || 'null'); }
    catch { return null; }
  },

  getToken() {
    return localStorage.getItem('blume_token') || null;
  },

  save(user, token) {
    localStorage.setItem('blume_user', JSON.stringify(user));
    if (token) localStorage.setItem('blume_token', token);
  },

  logout() {
    localStorage.removeItem('blume_user');
    localStorage.removeItem('blume_token');
    window.location.href = 'auth.html';
  },

  isLoggedIn() {
    return !!Auth.get() && !!Auth.getToken();
  },

  updateNav() {
    const user = Auth.get();

    document.querySelectorAll('.nav-auth-link')
      .forEach(el => el.style.display = user ? 'none' : '');

    document.querySelectorAll('.nav-user-menu')
      .forEach(el => {
        el.style.display = user ? 'flex' : 'none';
        const name = el.querySelector('.nav-user-name');
        if (name && user) name.textContent = user.firstName || 'Guest';
      });
  }
};