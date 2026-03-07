import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard'; // 👇 IMPORTANDO NOSSA TELA NOVA
import { MainLayout } from './layout/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          {/* 👇 COLOCANDO NOSSA TELA AQUI */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sessao" element={<h2 style={{color:'white', padding: 20}}>Configurar Sessão em breve</h2>} />
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