import { useEffect, useState } from 'react';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('/api/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load history');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      })
      .catch(() => setError('Could not load purchase history'));
  }, []);

  return (
    <div className="container">
      <h1>My Purchase History</h1>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && !error && <p>No purchases yet.</p>}

      {orders.map((o) => (
        <div className="card" key={o._id || o.id}>
          <p>
            <strong>{new Date(o.createdAt || Date.now()).toLocaleString()}</strong> — Total: ${Number(o.total || 0).toFixed(2)}
          </p>
          <ul>
            {o.items?.map((it, i) => (
              <li key={i}>{it.name} × {it.qty} (${Number(it.priceAtSale || 0).toFixed(2)} each)</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}