import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { router } from './router';
import { getAccessToken } from './utils/tokenUtils';
import { mockGetCurrentUser } from './services/mockAuthService';
import { loginSuccess, setLoading } from './store/slices/authSlice';
import './styles/global.css';

const initAuth = async () => {
  const token = getAccessToken();
  if (token) {
    try {
      store.dispatch(setLoading(true));
      const user = await mockGetCurrentUser(token);
      store.dispatch(loginSuccess({ user, accessToken: token }));
    } catch {
    } finally {
      store.dispatch(setLoading(false));
    }
  }
};

initAuth();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);