import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// 👇 Importando da nossa nova pasta!
import { Login } from './pages/Login';

// Placeholder até montarmos a tela do Dashboard de verdade
const Dashboard = () => (
  <div style={{ color: 'white', padding: '50px', textAlign: 'center', background: '#0f0a1a', height: '100vh' }}>
    <h1>🚀 Bem-vindo ao Dashboard do AutoPost!</h1>
    <p>Autenticação feita com sucesso.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;