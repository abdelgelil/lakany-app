import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'react-datepicker/dist/react-datepicker.css';
import { LanguageProvider } from './patient/LanguageContext.jsx'; // Import LanguageProvider
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider> {/* Wrap App with LanguageProvider */}
      <Toaster 
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#ffffff',
            color: '#1e40af',
          },
        }}
      />
      <App />
    </LanguageProvider>
  </React.StrictMode>,
);