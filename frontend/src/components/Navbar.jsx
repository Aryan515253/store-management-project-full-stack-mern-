import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav>
      <Link to="/">Home</Link>
      {!user && <Link to="/login">Login</Link>}
      {!user && <Link to="/register">Register</Link>}
      {user && <Link to="/dashboard">Dashboard</Link>}
      {user && <span style={{ color: 'white', fontSize: 14 }}>Hi, {user.name}</span>}
      {user && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
}