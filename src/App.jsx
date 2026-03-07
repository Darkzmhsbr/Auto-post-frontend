import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SessaoTelegram } from './pages/SessaoTelegram'; // 👇 IMPORTANDO A NOVA TELA
import { GerenciarBots } from './pages/GerenciarBots'; // 👇 TELA DE GERENCIAR BOTS
import { MainLayout } from './layout/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* 👇 COLOCANDO NOSSA TELA AQUI */}
          <Route path="/sessao" element={<SessaoTelegram />} />
          <Route path="/bots" element={<GerenciarBots />} />
          
          <Route path="/canais" element={<h2 style={{color:'white', padding: 20}}>Gerenciar Canais em breve</h2>} />
          <Route path="/fila" element={<h2 style={{color:'white', padding: 20}}>Fila de Envios em breve</h2>} />
          <Route path="/logs" element={<h2 style={{color:'white', padding: 20}}>Histórico em breve</h2>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;