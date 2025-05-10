import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ admin: null, isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const response = await axios.get('http://localhost:8000/api/admin/sessions', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.status === 200) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 > Date.now()) {
              setAuth({
                admin: { id: payload.adminId, email: payload.email, currentSessionId: payload.currentSessionId },
                isAuthenticated: true,
              });
            } else {
              localStorage.removeItem('token');
              setAuth({ admin: null, isAuthenticated: false });
            }
          } else {
            throw new Error('Invalid token');
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          localStorage.removeItem('token');
          setAuth({ admin: null, isAuthenticated: false });
        }
      } else {
        setAuth({ admin: null, isAuthenticated: false });
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (admin, token) => {
    localStorage.setItem('token', token);
    setAuth({ admin, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ admin: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ auth, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };