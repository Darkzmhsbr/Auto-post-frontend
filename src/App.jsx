import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SessaoTelegram } from './pages/SessaoTelegram'; // 👇 IMPORTANDO A NOVA TELA
import { GerenciarBots } from './pages/GerenciarBots'; // 👇 TELA DE GERENCIAR BOTS
import { GerenciarCanais } from './pages/GerenciarCanais'; // 👇 TELA DE CANAIS/PONTES
import { FilaEnvios } from './pages/FilaEnvios'; // 👇 TELA DA FILA DE ENVIOS
import { Historico } from './pages/Historico'; // 👇 TELA DE HISTÓRICO/LOGS
import { SuperAdminAutoPost } from './pages/SuperAdminAutoPost'; // 👇 SUPER ADMIN
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