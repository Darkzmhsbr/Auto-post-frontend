import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { 
  Layers, ToggleRight, Smartphone, Activity, AlertTriangle, CheckCircle 
} from 'lucide-react';
import './Dashboard.css';

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: '#888' }}>
        <p>Carregando informações do painel...</p>
      </div>
    );
  }

  // Verifica se a sessão do Telethon está ativa (por enquanto mockada como pendente)
  const isSessionActive = stats?.status_sessao === 'ativa';

  return (
    <div className="dashboard-container">
      
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Visão Geral</h1>
        <p>Acompanhe o desempenho das suas automações do Telegram.</p>
      </div>

      {/* AVISO DE SESSÃO DO TELEGRAM */}
      <div className={`status-banner ${isSessionActive ? 'active' : ''}`}>
        <div className="status-info">
          {isSessionActive ? (
            <CheckCircle size={32} color="#22c55e" />
          ) : (
            <AlertTriangle size={32} color="#f97316" />
          )}
          <div className="status-text">
            <h3>{isSessionActive ? 'Sessão do Telegram Ativa' : 'Telegram Desconectado'}</h3>
            <p>
              {isSessionActive 
                ? 'Sua conta está conectada e pronta para encaminhar postagens.'
                : 'Você precisa conectar sua conta do Telegram para o AutoPost funcionar.'}
            </p>
          </div>
        </div>
        {!isSessionActive && (
          <Link to="/sessao" className="status-btn connect">Conectar Conta</Link>
        )}
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Layers size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Canais Configurados</span>
            <span className="stat-value">{stats?.total_canais_configurados || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <ToggleRight size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Automações Ativas</span>
            <span className="stat-value">{stats?.canais_ativos || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Activity size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Posts Enviados Hoje</span>
            <span className="stat-value">0</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Smartphone size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Status do Motor</span>
            <span className="stat-value" style={{ fontSize: '1.2rem', marginTop: '5px' }}>
              Operante
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}