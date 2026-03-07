import React, { useEffect, useState } from 'react';
import { History, Trash2, CheckCircle, AlertCircle, Loader2, RefreshCw, Filter, Clock, Info } from 'lucide-react';
import './Historico.css';
import api from '../services/api';

export function Historico() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    carregarLogs();
  }, [filter]);

  const carregarLogs = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?action_filter=${filter}` : '';
      const { data } = await api.get(`/api/autopost/logs${params}`);
      setLogs(data);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Tem certeza que deseja limpar todo o histórico?')) return;
    try {
      await api.delete('/api/autopost/logs');
      showFeedback('Histórico limpo!', 'success');
      setLogs([]);
    } catch {
      showFeedback('Erro ao limpar histórico.', 'error');
    }
  };

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  const actionLabels = {
    posts_sent: { label: 'Posts Enviados', color: '#22c55e', icon: '📤' },
    engine_error: { label: 'Erro no Motor', color: '#ef4444', icon: '⚠️' },
    channel_created: { label: 'Canal Criado', color: '#3b82f6', icon: '➕' },
    channel_deleted: { label: 'Canal Removido', color: '#f97316', icon: '🗑️' },
  };

  const getActionConfig = (action) => {
    return actionLabels[action] || { label: action, color: '#888', icon: '📋' };
  };

  return (
    <div className="historico-container">
      <div className="historico-header">
        <div>
          <h1><History size={28} /> Histórico</h1>
          <p>Registro de todas as atividades do motor AutoPost.</p>
        </div>
        <div className="historico-actions">
          <div className="historico-filter">
            <Filter size={14} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="all">Todas as ações</option>
              <option value="posts_sent">Posts Enviados</option>
              <option value="engine_error">Erros do Motor</option>
            </select>
          </div>
          <button className="historico-refresh-btn" onClick={carregarLogs}>
            <RefreshCw size={16} />
          </button>
          {logs.length > 0 && (
            <button className="historico-clear-btn" onClick={handleClearAll}>
              <Trash2 size={14} /> Limpar
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`historico-toast ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="historico-loading">
          <Loader2 size={24} className="spin" />
          <p>Carregando histórico...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="historico-empty">
          <History size={40} strokeWidth={1} />
          <p>Nenhum registro encontrado.</p>
          <span>As atividades do motor serão registradas aqui automaticamente.</span>
        </div>
      ) : (
        <div className="historico-timeline">
          {logs.map((log) => {
            const config = getActionConfig(log.action);
            return (
              <div key={log.id} className="timeline-item">
                <div className="timeline-icon" style={{ color: config.color }}>
                  <span>{config.icon}</span>
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-action" style={{ color: config.color }}>
                      {config.label}
                    </span>
                    <span className="timeline-date">
                      <Clock size={12} />
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  {log.details && (
                    <div className="timeline-details">
                      {log.details.count && (
                        <span className="detail-tag">📊 {log.details.count} posts</span>
                      )}
                      {log.details.mode && (
                        <span className="detail-tag">⚙️ {log.details.mode}</span>
                      )}
                      {log.details.origin && (
                        <span className="detail-tag">📡 {log.details.origin}</span>
                      )}
                      {log.details.dest && (
                        <span className="detail-tag">🎯 {log.details.dest}</span>
                      )}
                      {log.details.error && (
                        <span className="detail-tag error">❌ {log.details.error}</span>
                      )}
                      {log.details.channel_id && (
                        <span className="detail-tag">🔗 Canal #{log.details.channel_id}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}