import React from 'react';
import { Menu, Zap } from 'lucide-react';
import './Header.css';

export function Header({ onToggleMenu }) {
  return (
    <header className="main-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleMenu}>
          <Menu size={24} />
        </button>
        <div className="header-title">
          <Zap size={18} color="#c333ff" />
          <span>Visão Geral</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="user-badge">
          <div className="user-avatar">ZP</div>
        </div>
      </div>
    </header>
  );
}