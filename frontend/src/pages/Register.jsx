import { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    employeeType: 'cashier'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || 'Registration failed');
        return;
      }

      setSuccess('User is successfully registered!');
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        employeeType: 'cashier'
      });
    } catch {
      setError('Server communication error');
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          placeholder="Name" 
          value={form.name} 
          onChange={(e) => update('name', e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={form.email} 
          onChange={(e) => update('email', e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={form.password} 
          onChange={(e) => update('password', e.target.value)} 
          required 
        />

        <select value={form.role} onChange={(e) => update('role', e.target.value)}>
          <option value="customer">Customer</option>
          <option value="employee">Employee</option>
        </select>

        {form.role === 'employee' && (
          <select value={form.employeeType} onChange={(e) => update('employeeType', e.target.value)}>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
          </select>
        )}

        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        {success && <p style={{ color: 'green', margin: 0, fontWeight: 'bold' }}>{success}</p>}
        
        <button type="submit">Create account</button>
      </form>
    </div>
  );
}