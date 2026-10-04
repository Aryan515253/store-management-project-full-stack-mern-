import { useState, useEffect } from 'react';

export default function EmployeeDashboard() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sales, setSales] = useState([]);

  function authHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }

  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch('/api/products', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch {
      setError('Failed to fetch products');
    }
  }

  async function loadSales() {
    try {
      const res = await fetch('/api/orders', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setSales(data);
    } catch {
      setError('Failed to fetch sales history');
    }
  }

  function addToCart(product) {
    setMessage('');
    setError('');
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product._id);
      if (existing) {
        return prev.map((c) =>
          c.productId === product._id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { productId: product._id, name: product.name, price: product.price, qty: 1 }];
    });
  }

  function updateQty(productId, qty) {
    setMessage('');
    setError('');
    const parsed = Math.max(1, Number(qty));
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, qty: parsed } : c)));
  }

  function removeFromCart(productId) {
    setMessage('');
    setError('');
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  async function handleGenerateBill() {
    setError('');
    setMessage('');

    if (cart.length === 0) {
      setError('Cart is empty.');
      return;
    }

    if (!customerEmail.trim()) {
      setError('Please enter customer email.');
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          customerEmail: customerEmail.trim(),
          items: cart.map((c) => ({ productId: c.productId, qty: c.qty }))
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || 'Could not generate bill');
        return;
      }

      setMessage(`Bill generated successfully. Total: $${Number(data.total || cartTotal).toFixed(2)}`);
      setCart([]);
      setCustomerEmail('');
      loadProducts();
      loadSales();
    } catch {
      setError('Error generating bill');
    }
  }

  function handleNewBill() {
    setCart([]);
    setCustomerEmail('');
    setMessage('');
    setError('');
  }

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <h1>Employee Billing Dashboard</h1>

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Products Section */}
        <div>
          <h2>Available Products</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {products.map((p) => (
              <div key={p._id} style={{ border: '1px solid #ccc', padding: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{p.name}</strong> - ${p.price} | Stock: {p.stock}
                </div>
                <button onClick={() => addToCart(p)} disabled={p.stock <= 0}>
                  {p.stock > 0 ? 'Add to Bill' : 'Out of Stock'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Cart Section */}
        <div>
          <h2>Current Bill</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Customer Email:</label>
            <input 
              type="email" 
              placeholder="Enter customer email" 
              value={customerEmail}
              onChange={(e) => {
                setMessage('');
                setError('');
                setCustomerEmail(e.target.value);
              }}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          {cart.length === 0 ? (
            <p>No items added to bill yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.productId} style={{ borderBottom: '1px solid #eee' }}>
                    <td>{item.name}</td>
                    <td>${item.price}</td>
                    <td>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.qty} 
                        onChange={(e) => updateQty(item.productId, e.target.value)} 
                        style={{ width: '50px' }}
                      />
                    </td>
                    <td>${(item.price * item.qty).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeFromCart(item.productId)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3 style={{ marginTop: '1rem' }}>Grand Total: ${cartTotal.toFixed(2)}</h3>

          {/* Success Message & Next Bill Action */}
          {message ? (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e2e8f0', borderRadius: '6px' }}>
              <p style={{ color: 'green', fontWeight: 'bold', margin: 0 }}>{message}</p>
              <button 
                onClick={handleNewBill} 
                style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Generate Another Bill
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={handleGenerateBill} 
                disabled={cart.length === 0}
                style={{ padding: '8px 16px', cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                Generate Bill
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sales History */}
      <div style={{ marginTop: '3rem' }}>
        <h2>Recent Sales History</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s._id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{s._id}</td>
                <td>{s.customer ? `${s.customer.name} (${s.customer.email})` : 'Guest'}</td>
                <td>${s.total?.toFixed(2)}</td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}