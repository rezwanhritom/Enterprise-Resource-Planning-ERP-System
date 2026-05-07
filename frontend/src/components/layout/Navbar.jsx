import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../ui/Button.jsx';

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div>
        <p className="navbar-eyebrow">Workspace</p>
        <h1 className="navbar-title">Dashboard</h1>
      </div>
      <Button variant="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  );
}
