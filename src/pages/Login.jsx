import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
// 👇 Olha a importação puxando da pasta services aqui!
import { authService } from '../services/api'; 
import './Login.css';

export function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const tokenUrl = searchParams.get('token');
    const tokenLocal = localStorage.getItem('zenyx_token');

    if (tokenUrl) {
      localStorage.setItem('zenyx_token', tokenUrl);
      validarAcesso();
    } else if (tokenLocal) {
      validarAcesso();
    } else {
      setStatus('error');
    }
  }, []);

  const validarAcesso = async () => {
    try {
      await authService.getMe();
      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      localStorage.removeItem('zenyx_token');
      setStatus('error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-glow">AutoPost</div>
          <p>Extensão Oficial Zenyx VIPs</p>
        </div>
        
        <div className="login-body">
          {status === 'loading' && (
            <div className="status-box loading">
              <div className="spinner"></div>
              <p>Autenticando sessão segura...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="status-box success">
              <ShieldCheck size={48} color="#22c55e" />
              <h3>Acesso Liberado!</h3>
              <p>Redirecionando para o seu painel...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="status-box error">
              <AlertTriangle size={48} color="#ef4444" />
              <h3>Acesso Negado</h3>
              <p style={{ color: '#a3a3a3', marginTop: '10px', fontSize: '0.9rem' }}>
                O login no AutoPost deve ser feito através da plataforma principal.
              </p>
              <a href="https://www.zenyxvips.com/recursos-prime" className="btn-voltar">
                Voltar para Zenyx VIPs
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}