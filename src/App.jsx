import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SessaoTelegram } from './pages/SessaoTelegram';
import { GerenciarBots } from './pages/GerenciarBots';
import { GerenciarCanais } from './pages/GerenciarCanais';
import { FilaEnvios } from './pages/FilaEnvios';
import { Historico } from './pages/Historico';
import { SuperAdminAutoPost } from './pages/SuperAdminAutoPost';
import { Clonex } from './pages/Clonex';
import { Ferramentas } from './pages/Ferramentas'; // 👈 NOVO
import { MainLayout } from './layout/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sessao" element={<SessaoTelegram />} />
          <Route path="/bots" element={<GerenciarBots />} />
          <Route path="/canais" element={<GerenciarCanais />} />
          <Route path="/clonex" element={<Clonex />} />
          <Route path="/ferramentas" element={<Ferramentas />} /> {/* 👈 NOVO */}
          <Route path="/fila" element={<FilaEnvios />} />
          <Route path="/logs" element={<Historico />} />
          <Route path="/admin" element={<SuperAdminAutoPost />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;