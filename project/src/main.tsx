import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Routes from './routes';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Routes />
      <ToastContainer position="top-right" />
    </AuthProvider>
  </StrictMode>
);
