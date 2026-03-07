import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './MainLayout.css';

export function MainLayout() {
  // Controle do menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Proteção simples: se não tem token, chuta pro login
  const token = localStorage.getItem('zenyx_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <div className="main-content">
        <Header onToggleMenu={() => setIsMobileMenuOpen(true)} />
        
        {/* Overlay escuro para celular quando o menu abrir */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        <main className="page-content">
          <Outlet /> {/* Aqui dentro vão renderizar as páginas (Dashboard, Canais, etc) */}
        </main>
      </div>
    </div>
  );
}