import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Smartphone, Layers, ListOrdered, 
  History, X, LogOut, ExternalLink
} from 'lucide-react';
import './Sidebar.css';

export function Sidebar({ isOpen, onClose }) {
  const handleLogout = () => {
    localStorage.removeItem('zenyx_token');
    window.location.href = '/login';
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          AutoPost
        </div>
        <button className="close-sidebar-btn" onClick={onClose}>
          <X size={24} color="#a3a3a3" />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Menu Principal</div>
        
        <NavLink to="/dashboard" className="nav-item" onClick={onClose}>
          <LayoutDashboard size={20} /> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/sessao" className="nav-item" onClick={onClose}>
          <Smartphone size={20} /> <span>Sessão Telegram</span>
        </NavLink>

        <NavLink to="/canais" className="nav-item" onClick={onClose}>
          <Layers size={20} /> <span>Meus Canais</span>
        </NavLink>

        <NavLink to="/fila" className="nav-item" onClick={onClose}>
          <ListOrdered size={20} /> <span>Fila de Postagens</span>
        </NavLink>

        <NavLink to="/logs" className="nav-item" onClick={onClose}>
          <History size={20} /> <span>Histórico (Logs)</span>
        </NavLink>

        <div className="divider"></div>

        <a href="https://www.zenyxvips.com/dashboard" className="nav-item return-btn">
          <ExternalLink size={20} /> <span>Voltar p/ Zenyx VIPs</span>
        </a>

        <div className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> <span>Sair do Sistema</span>
        </div>
      </nav>
    </aside>
  );
}