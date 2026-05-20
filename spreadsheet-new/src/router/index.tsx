import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import SpreadsheetPage from '@/pages/SpreadsheetPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'documents/:documentId',
        element: <SpreadsheetPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);