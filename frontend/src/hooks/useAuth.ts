/**
 * Custom Hook para autenticación
 */

import { useState, useEffect } from 'react';
import { mockAuthService } from '../services/mockApi';
import { User } from '../types';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario del localStorage al iniciar
    const currentUser = mockAuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await mockAuthService.login(email, password);
      setUser(result.user);
      toast.success(`¡Bienvenido ${result.user.name}!`);
      return result;
    } catch (error) {
      toast.error('Error al iniciar sesión');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await mockAuthService.logout();
      setUser(null);
      toast.info('Sesión cerrada');
    } catch (error) {
      toast.error('Error al cerrar sesión');
      throw error;
    }
  };

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
};
