import React from 'react';
import { Menu, Zap, User } from 'lucide-react';
import './Header.css';

export function Header({ onToggleMenu }) {
  return (
    <header className="main-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleMenu}>
          <Menu size={24} />
        </button>
        <div className="header-title">
          <Zap size={20} color="var(--primary)" />
          <span>AutoPost Oficial</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="user-badge">
          <div className="user-avatar">
            <User size={18} color="#fff" />
          </div>
        </div>
      </div>
    </header>
  );
}