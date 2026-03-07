import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { 
  Layers, ToggleRight, Smartphone, Activity, AlertTriangle, CheckCircle,
  Bot, Target, Clock, RefreshCw, ArrowRight, Zap
} from 'lucide-react';
import './Dashboard.css';

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(carregarDados, 30000);
    return () => clearInterval(interval);
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

  const isSessionActive = stats?.status_sessao === 'ativa';
  const engineRunning = stats?.engine?.running;
  const nextTick = stats?.engine?.next_tick;

  return (
    <div className="dashboard-container">
      
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Visão Geral</h1>
          <p>Acompanhe o desempenho das suas automações do Telegram.</p>
        </div>
        <button className="dash-refresh-btn" onClick={carregarDados}>
          <RefreshCw size={16} />
        </button>
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
            <span className="stat-value">{stats?.posts_enviados_hoje || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Bot size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Bots Cadastrados</span>
            <span className="stat-value">{stats?.total_bots || 0}</span>
          </div>
        </div>
      </div>

      {/* STATUS DO MOTOR */}
      <div className={`engine-status-card ${engineRunning ? 'running' : 'stopped'}`}>
        <div className="engine-left">
          <Zap size={22} />
          <div>
            <h3>Motor AutoPost</h3>
            <p>{engineRunning ? 'Operante — verificando canais a cada 30 segundos' : 'Motor parado'}</p>
          </div>
        </div>
        <div className="engine-right">
          <div className="engine-stat">
            <span className="engine-stat-label">Userbots</span>
            <span className="engine-stat-value">{stats?.engine?.userbots_connected || 0}</span>
          </div>
          <div className="engine-stat">
            <span className="engine-stat-label">Bots Ativos</span>
            <span className="engine-stat-value">{stats?.engine?.bots_connected || 0}</span>
          </div>
          <div className={`engine-indicator ${engineRunning ? 'on' : 'off'}`}>
            {engineRunning ? '🟢' : '🔴'}
          </div>
        </div>
      </div>

      {/* ATALHOS RÁPIDOS */}
      <div className="quick-actions">
        <h2>Ações Rápidas</h2>
        <div className="quick-grid">
          <Link to="/bots" className="quick-card">
            <Bot size={24} />
            <span>Gerenciar Bots</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/canais" className="quick-card">
            <Layers size={24} />
            <span>Canais / Pontes</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/fila" className="quick-card">
            <Clock size={24} />
            <span>Fila de Envios</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/logs" className="quick-card">
            <Activity size={24} />
            <span>Histórico</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

    </div>
  );
}