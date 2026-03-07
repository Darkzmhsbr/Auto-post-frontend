import React, { useEffect, useState } from 'react';
import { ListOrdered, Trash2, CheckCircle, AlertCircle, Loader2, Clock, RefreshCw, Filter } from 'lucide-react';
import './FilaEnvios.css';
import api from '../services/api';

export function FilaEnvios() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    carregarFila();
  }, [filter]);

  const carregarFila = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status_filter=${filter}` : '';
      const { data } = await api.get(`/api/autopost/queue${params}`);
      setQueue(data);
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/api/autopost/queue/${itemId}`);
      showFeedback('Item removido da fila!', 'success');
      carregarFila();
    } catch {
      showFeedback('Erro ao remover item.', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Tem certeza que deseja limpar TODA a fila de envios?')) return;
    try {
      const { data } = await api.delete('/api/autopost/queue');
      showFeedback(data.message || 'Fila limpa!', 'success');
      carregarFila();
    } catch {
      showFeedback('Erro ao limpar fila.', 'error');
    }
  };

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const statusConfig = {
    pending: { label: 'Pendente', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
    sent: { label: 'Enviado', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
    error: { label: 'Erro', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  return (
    <div className="fila-container">
      <div className="fila-header">
        <div>
          <h1><ListOrdered size={28} /> Fila de Envios</h1>
          <p>Acompanhe os posts processados, enviados e com erro.</p>
        </div>
        <div className="fila-actions">
          <div className="fila-filter">
            <Filter size={14} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="sent">Enviados</option>
              <option value="error">Com Erro</option>
            </select>
          </div>
          <button className="fila-refresh-btn" onClick={carregarFila}>
            <RefreshCw size={16} /> Atualizar
          </button>
          {queue.length > 0 && (
            <button className="fila-clear-btn" onClick={handleClearAll}>
              <Trash2 size={14} /> Limpar Tudo
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`fila-toast ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="fila-loading">
          <Loader2 size={24} className="spin" />
          <p>Carregando fila...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="fila-empty">
          <ListOrdered size={40} strokeWidth={1} />
          <p>Nenhum item na fila.</p>
          <span>Quando o motor processar mensagens, elas aparecerão aqui.</span>
        </div>
      ) : (
        <div className="fila-table-wrapper">
          <table className="fila-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Tipo</th>
                <th>Preview</th>
                <th>Enviado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => {
                const st = statusConfig[item.status] || statusConfig.pending;
                const preview = item.content_json?.text_preview || item.content_json?.error || '—';
                const mode = item.content_json?.mode || item.media_type || '—';

                return (
                  <tr key={item.id} className={item.status === 'error' ? 'row-error' : ''}>
                    <td>
                      <span className="status-pill" style={{ color: st.color, background: st.bg }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="td-channel">{item.origin_channel_name}</td>
                    <td className="td-channel">{item.dest_channel_name}</td>
                    <td><span className="mode-tag">{mode}</span></td>
                    <td className="td-preview" title={preview}>{preview.substring(0, 60)}{preview.length > 60 ? '...' : ''}</td>
                    <td className="td-date">
                      <Clock size={12} />
                      {formatDate(item.sent_at || item.scheduled_for)}
                    </td>
                    <td>
                      <button className="fila-delete-btn" onClick={() => handleDelete(item.id)} title="Remover">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}