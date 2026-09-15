import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployerRoute = ({ children }) => {
  const { user, loading, userProfile, isAdmin } = useAuth();

  console.log("EMPLOYER ROUTE:", { user, userProfile, isAdmin });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin can also access employer features
  if (isAdmin || userProfile?.role === 'employer') {
    return children;
  }

  return <Navigate to="/" replace />;
};

export default EmployerRoute;