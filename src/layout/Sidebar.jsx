import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Smartphone, Layers, ListOrdered, 
  History, X, LogOut, ExternalLink, Bot, ChevronDown, ChevronRight, PlusCircle
} from 'lucide-react';
import './Sidebar.css';

export function Sidebar({ isOpen, onClose }) {
  const [isBotsOpen, setIsBotsOpen] = useState(false);

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

        <div className="nav-dropdown">
          <div className={`nav-item dropdown-toggle ${isBotsOpen ? 'active' : ''}`} onClick={() => setIsBotsOpen(!isBotsOpen)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bot size={20} /> <span>Meus Bots</span>
            </div>
            {isBotsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          <div className={`dropdown-content ${isBotsOpen ? 'show' : ''}`}>
            <NavLink to="/criar-bot" className="sub-nav-item" onClick={onClose}>
              <PlusCircle size={16} /> <span>Criar novo Bot</span>
            </NavLink>
            <NavLink to="/meus-bots" className="sub-nav-item" onClick={onClose}>
              <Bot size={16} /> <span>Gerenciar Bots</span>
            </NavLink>
          </div>
        </div>

        <NavLink to="/canais" className="nav-item" onClick={onClose}>
          <Layers size={20} /> <span>Canais / Pontes</span>
        </NavLink>

        <NavLink to="/fila" className="nav-item" onClick={onClose}>
          <ListOrdered size={20} /> <span>Fila de Envios</span>
        </NavLink>

        <NavLink to="/logs" className="nav-item" onClick={onClose}>
          <History size={20} /> <span>Histórico</span>
        </NavLink>

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