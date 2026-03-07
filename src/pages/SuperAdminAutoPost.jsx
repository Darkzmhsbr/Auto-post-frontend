import React, { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import {
  Shield, Users, Layers, Bot, Activity, Zap, RefreshCw, Trash2,
  Power, PowerOff, Eye, UserPlus, UserMinus, AlertCircle, CheckCircle,
  Loader2, ChevronDown, ChevronUp, BarChart3
} from 'lucide-react';
import './SuperAdminAutoPost.css';

export function SuperAdminAutoPost() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [feedback, setFeedback] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userChannels, setUserChannels] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.listUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error);
      if (error.response?.status === 403) {
        showFeedback('Acesso negado: você não é super admin.', 'error');
      }
    } finally { setLoading(false); }
  };

  const handleToggleUser = async (userId) => {
    try {
      const result = await adminService.toggleUser(userId);
      showFeedback(result.message, 'success');
      loadData();
    } catch { showFeedback('Erro ao alterar status.', 'error'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`ATENÇÃO: Isso vai DELETAR o usuário "${userId}" e TODOS os seus dados (canais, bots, fila, logs). Confirma?`)) return;
    try {
      await adminService.deleteUser(userId);
      showFeedback('Usuário deletado!', 'success');
      loadData();
    } catch { showFeedback('Erro ao deletar.', 'error'); }
  };

  const handlePromote = async (userId) => {
    try {
      const result = await adminService.promote(userId);
      showFeedback(result.message, 'success');
    } catch { showFeedback('Erro ao promover.', 'error'); }
  };

  const handleExpandUser = async (userId) => {
    if (expandedUser === userId) { setExpandedUser(null); return; }
    setExpandedUser(userId);
    if (!userChannels[userId]) {
      try {
        const channels = await adminService.getUserChannels(userId);
        setUserChannels(prev => ({ ...prev, [userId]: channels }));
      } catch { console.error('Erro ao carregar canais'); }
    }
  };

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading) return (
    <div className="sa-ap-loading"><Loader2 size={24} className="spin" /><p>Carregando painel admin...</p></div>
  );

  return (
    <div className="sa-ap-container">
      <div className="sa-ap-header">
        <div>
          <h1><Shield size={28} /> Painel Super Admin</h1>
          <p>Controle total sobre todas as automações do sistema.</p>
        </div>
        <button className="sa-ap-refresh" onClick={loadData}><RefreshCw size={16} /> Atualizar</button>
      </div>

      {feedback && (
        <div className={`sa-ap-toast ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TABS */}
      <div className="sa-ap-tabs">
        <button className={`sa-ap-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <BarChart3 size={16} /> Visão Geral
        </button>
        <button className={`sa-ap-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={16} /> Usuários ({users.length})
        </button>
      </div>

      {/* TAB: VISÃO GERAL */}
      {activeTab === 'overview' && stats && (
        <>
          <div className="sa-ap-stats-grid">
            <div className="sa-ap-stat-card">
              <Users size={24} />
              <div>
                <span className="sa-ap-stat-value">{stats.users?.total || 0}</span>
                <span className="sa-ap-stat-label">Usuários</span>
                <span className="sa-ap-stat-sub">{stats.users?.active_sessions || 0} sessões ativas</span>
              </div>
            </div>
            <div className="sa-ap-stat-card">
              <Layers size={24} />
              <div>
                <span className="sa-ap-stat-value">{stats.channels?.total || 0}</span>
                <span className="sa-ap-stat-label">Canais</span>
                <span className="sa-ap-stat-sub">{stats.channels?.active || 0} ativos</span>
              </div>
            </div>
            <div className="sa-ap-stat-card">
              <Bot size={24} />
              <div>
                <span className="sa-ap-stat-value">{stats.bots?.total || 0}</span>
                <span className="sa-ap-stat-label">Bots</span>
              </div>
            </div>
            <div className="sa-ap-stat-card">
              <Activity size={24} />
              <div>
                <span className="sa-ap-stat-value">{stats.queue?.sent || 0}</span>
                <span className="sa-ap-stat-label">Posts Enviados</span>
                <span className="sa-ap-stat-sub">{stats.queue?.errors || 0} erros</span>
              </div>
            </div>
          </div>

          <div className="sa-ap-engine-card">
            <Zap size={20} />
            <div className="sa-ap-engine-info">
              <h3>Motor AutoPost</h3>
              <p>{stats.engine?.running ? '🟢 Operante' : '🔴 Parado'} — {stats.engine?.userbots_connected || 0} userbots / {stats.engine?.bots_connected || 0} bots conectados</p>
            </div>
          </div>
        </>
      )}

      {/* TAB: USUÁRIOS */}
      {activeTab === 'users' && (
        <div className="sa-ap-users-section">
          {users.length === 0 ? (
            <div className="sa-ap-empty"><Users size={40} strokeWidth={1} /><p>Nenhum usuário encontrado.</p></div>
          ) : (
            <div className="sa-ap-users-list">
              {users.map((u) => (
                <div key={u.user_id} className={`sa-ap-user-card ${u.is_active ? '' : 'inactive'}`}>
                  <div className="sa-ap-user-main" onClick={() => handleExpandUser(u.user_id)}>
                    <div className="sa-ap-user-info">
                      <div className="sa-ap-user-avatar">{(u.user_id || '?').substring(0, 2).toUpperCase()}</div>
                      <div>
                        <h3>{u.user_id}</h3>
                        <span className="sa-ap-user-phone">{u.phone || 'Sem telefone'}</span>
                      </div>
                    </div>
                    <div className="sa-ap-user-metrics">
                      <div className="sa-ap-metric"><Layers size={13} /><span>{u.total_channels} canais</span></div>
                      <div className="sa-ap-metric"><Bot size={13} /><span>{u.total_bots} bots</span></div>
                      <div className="sa-ap-metric"><Activity size={13} /><span>{u.total_sent} enviados</span></div>
                      <div className={`sa-ap-user-status ${u.is_active ? 'on' : 'off'}`}>
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                    {expandedUser === u.user_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {/* EXPANDIDO: Canais + Ações */}
                  {expandedUser === u.user_id && (
                    <div className="sa-ap-user-expanded">
                      <div className="sa-ap-user-actions">
                        <button className="sa-ap-action-btn toggle" onClick={() => handleToggleUser(u.user_id)}>
                          {u.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                          {u.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button className="sa-ap-action-btn promote" onClick={() => handlePromote(u.user_id)}>
                          <UserPlus size={14} /> Promover Admin
                        </button>
                        <button className="sa-ap-action-btn danger" onClick={() => handleDeleteUser(u.user_id)}>
                          <Trash2 size={14} /> Deletar Tudo
                        </button>
                      </div>

                      {userChannels[u.user_id] && userChannels[u.user_id].length > 0 && (
                        <div className="sa-ap-user-channels">
                          <h4>Canais configurados ({userChannels[u.user_id].length})</h4>
                          {userChannels[u.user_id].map((ch) => (
                            <div key={ch.id} className="sa-ap-ch-item">
                              <span className={`sa-ap-ch-type ${ch.channel_type}`}>{ch.channel_type}</span>
                              <span className="sa-ap-ch-route">{ch.origin_channel_name || ch.origin_channel_id} → {ch.dest_channel_name || ch.dest_channel_id}</span>
                              <span className={`sa-ap-ch-status ${ch.is_active ? 'on' : 'off'}`}>{ch.is_active ? 'Ativo' : 'Pausado'}</span>
                              <span className="sa-ap-ch-count">{ch.total_forwarded} env.</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}