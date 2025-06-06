import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthGuard = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate('/threads');
    }
  }, [isLoggedIn, isLoading, navigate]);

  if (isLoading || isLoggedIn) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};

export default AuthGuard; 