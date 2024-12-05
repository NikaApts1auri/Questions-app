import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useAtom } from 'jotai';
import { logoutUser as apiLogoutUser } from '../api/logout';
import { refreshToken as apiRefreshToken } from '../api/refreshToken';
import { isAuthenticatedAtom } from '../store/authAtoms';

const isTokenExpired = (token: string) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
};

export const useLogout = () => {
  const navigate = useNavigate();
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);

  const refreshMutation = useMutation(apiRefreshToken, {
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.access);
      logoutMutation.mutate();
    },
    onError: (error) => {
      console.error('Error refreshing token:', error);
      navigate('/login');
    },
  });

  const logoutMutation = useMutation(apiLogoutUser, {
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      navigate('/login');
    },
    onError: (error) => {
      console.error('Error logging out:', error);
      navigate('/login');
    },
  });

  const handleLogout = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && isTokenExpired(accessToken) && refreshToken) {
      refreshMutation.mutate(refreshToken);
    } else {
      logoutMutation.mutate();
    }
  };

  return { handleLogout };
};