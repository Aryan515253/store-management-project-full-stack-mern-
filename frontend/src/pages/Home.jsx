import { useEffect, useState } from 'react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setError('Could not load products'));
  }, []);

  return (
    <div className="container">
      <h1>Welcome to My Store</h1>
      <p>Browse our products below. Log in to see your purchase history or, if you're staff, to manage inventory and billing.</p>

      {error && <p className="error">{error}</p>}

      <h2 style={{ marginTop: '1.5rem' }}>Products</h2>
      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p._id || p.id}>
            {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', borderRadius: '4px' }} />}
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p><strong>${Number(p.price || 0).toFixed(2)}</strong></p>
            <p>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>
          </div>
        ))}
        {products.length === 0 && !error && <p>No products available right now.</p>}
      </div>
    </div>
  );
}