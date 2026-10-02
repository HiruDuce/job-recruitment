import React from 'react';
import { Outlet } from 'react-router';
import { Header } from '../components/client/Header';
import { Footer } from '../components/client/Footer';

export const ClientLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f8fafc',
      }}
    >
      <Header />
      <main style={{ flex: 1, padding: '32px 0' }}>
        <div className="client-container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};
