import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Smartphone, Layers, ListOrdered, 
  History, X, LogOut, ExternalLink, Bot, Shield, Copy, Wrench, Instagram
} from 'lucide-react';
import { adminService } from '../services/api';
import './Sidebar.css';

export function Sidebar({ isOpen, onClose }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    adminService.check().then(data => setIsAdmin(data.is_admin)).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('zenyx_token');
    window.location.href = '/login';
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span> AutoPost
        </div>
        <button className="close-sidebar-btn" onClick={onClose}><X size={24} /></button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Menu Principal</div>
        
        <NavLink to="/dashboard" className="nav-item" onClick={onClose}>
          <LayoutDashboard size={20} /> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/sessao" className="nav-item" onClick={onClose}>
          <Smartphone size={20} /> <span>Conta (Userbot)</span>
        </NavLink>

        <NavLink to="/bots" className="nav-item" onClick={onClose}>
          <Bot size={20} /> <span>Meus Bots</span>
        </NavLink>

        <NavLink to="/canais" className="nav-item" onClick={onClose}>
          <Layers size={20} /> <span>Canais / Pontes</span>
        </NavLink>

        <NavLink to="/clonex" className="nav-item clonex-btn" onClick={onClose}>
          <Copy size={20} /> <span>Clonex</span>
        </NavLink>

        <NavLink to="/ferramentas" className="nav-item ferramentas-btn" onClick={onClose}>
          <Wrench size={20} /> <span>Ferramentas</span>
        </NavLink>

        <NavLink to="/instagram" className="nav-item instagram-btn" onClick={onClose}>
          <Instagram size={20} /> <span>Instagram Farm</span>
        </NavLink>

        <NavLink to="/fila" className="nav-item" onClick={onClose}>
          <ListOrdered size={20} /> <span>Fila de Envios</span>
        </NavLink>

        <NavLink to="/logs" className="nav-item" onClick={onClose}>
          <History size={20} /> <span>Histórico</span>
        </NavLink>

        {isAdmin && (
          <>
            <div className="divider"></div>
            <div className="nav-label">Administração</div>
            <NavLink to="/admin" className="nav-item admin-btn" onClick={onClose}>
              <Shield size={20} /> <span>Super Admin</span>
            </NavLink>
          </>
        )}

        <div className="divider"></div>

        <a href="https://www.zenyxvips.com/dashboard" className="nav-item return-btn">
          <ExternalLink size={20} /> <span>Voltar p/ Zenyx</span>
        </a>

        <div className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> <span>Sair</span>
        </div>
      </nav>
    </aside>
  );
}