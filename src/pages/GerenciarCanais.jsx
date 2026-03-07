import React, { useEffect, useState } from 'react';
import { channelService, botService } from '../services/api';
import {
  Layers, Plus, Trash2, CheckCircle, AlertCircle, Loader2,
  ArrowRight, Power, PowerOff, Clock, Repeat, Search, Bot,
  MessageSquare, Copy
} from 'lucide-react';
import './GerenciarCanais.css';

export function GerenciarCanais() {
  const [channels, setChannels] = useState([]);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Campos do formulário
  const [form, setForm] = useState({
    bot_id: '',
    origin_channel_id: '',
    origin_channel_name: '',
    dest_channel_id: '',
    dest_channel_name: '',
    channel_type: 'clone',
    interval_minutes: 30,
    schedule_start: '',
    schedule_end: '',
    post_order: 'fifo',
    cta_find: '',
    cta_replace: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [canaisData, botsData] = await Promise.all([
        channelService.list(),
        botService.list(),
      ]);
      setChannels(canaisData);
      setBots(botsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CRIAR CANAL
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.origin_channel_id || !form.dest_channel_id) {
      showFeedbackMsg('Preencha os IDs de origem e destino!', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        bot_id: form.bot_id ? parseInt(form.bot_id) : null,
        origin_channel_id: parseInt(form.origin_channel_id),
        dest_channel_id: parseInt(form.dest_channel_id),
        interval_minutes: parseInt(form.interval_minutes),
        schedule_start: form.schedule_start || null,
        schedule_end: form.schedule_end || null,
        cta_find: form.cta_find || null,
        cta_replace: form.cta_replace || null,
      };
      await channelService.create(payload);
      showFeedbackMsg('Canal configurado com sucesso!', 'success');
      setForm({
        bot_id: '', origin_channel_id: '', origin_channel_name: '',
        dest_channel_id: '', dest_channel_name: '', channel_type: 'clone',
        interval_minutes: 30, schedule_start: '', schedule_end: '',
        post_order: 'fifo', cta_find: '', cta_replace: '',
      });
      setShowForm(false);
      carregarDados();
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erro ao criar canal.';
      showFeedbackMsg(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // TOGGLE ATIVO/INATIVO
  // ==========================================
  const handleToggle = async (channelId) => {
    try {
      const result = await channelService.toggle(channelId);
      showFeedbackMsg(result.message, 'success');
      carregarDados();
    } catch {
      showFeedbackMsg('Erro ao alterar status do canal.', 'error');
    }
  };

  // ==========================================
  // DELETAR CANAL
  // ==========================================
  const handleDelete = async (channelId, name) => {
    if (!window.confirm(`Remover a configuração "${name}"?`)) return;
    try {
      await channelService.remove(channelId);
      showFeedbackMsg('Canal removido com sucesso!', 'success');
      carregarDados();
    } catch {
      showFeedbackMsg('Erro ao remover canal.', 'error');
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const showFeedbackMsg = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(String(text));
    showFeedbackMsg('ID copiado!', 'success');
  };

  const channelTypeLabels = {
    clone: 'Clonar Posts',
    forward: 'Encaminhar',
    spy: 'Espionar (Ponte)',
  };

  const postOrderLabels = {
    fifo: 'FIFO (Primeiro a entrar)',
    lifo: 'LIFO (Último a entrar)',
    random: 'Aleatório',
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (loading) {
    return (
      <div className="canais-loading">
        <Loader2 size={24} className="spin" />
        <p>Carregando canais configurados...</p>
      </div>
    );
  }

  return (
    <div className="canais-container">

      {/* HEADER */}
      <div className="canais-header">
        <div className="canais-header-text">
          <h1><Layers size={28} /> Canais / Pontes</h1>
          <p>Configure as rotas de clonagem e encaminhamento entre canais do Telegram.</p>
        </div>
        <button className="canais-add-btn" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} />
          {showForm ? 'Cancelar' : 'Novo Canal'}
        </button>
      </div>

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div className={`canais-toast ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* FORMULÁRIO DE CRIAÇÃO */}
      {showForm && (
        <div className="canais-form-card">
          <div className="canais-form-title">
            <Plus size={20} />
            <h2>Nova Configuração de Canal</h2>
          </div>

          <form onSubmit={handleSubmit} className="canais-form">

            {/* BOT VINCULADO */}
            {bots.length > 0 && (
              <div className="form-group">
                <label>Bot Vinculado (Ponte)</label>
                <select
                  value={form.bot_id}
                  onChange={(e) => handleChange('bot_id', e.target.value)}
                  className="form-select"
                >
                  <option value="">Nenhum (usar Userbot direto)</option>
                  {bots.map((bot) => (
                    <option key={bot.id} value={bot.id}>
                      {bot.bot_name} — @{bot.bot_username}
                    </option>
                  ))}
                </select>
                <span className="field-hint">Selecione um Bot cadastrado para usar como "carteiro" na ponte.</span>
              </div>
            )}

            {/* TIPO E ORDEM */}
            <div className="form-row-3">
              <div className="form-group">
                <label>Tipo de Operação</label>
                <select
                  value={form.channel_type}
                  onChange={(e) => handleChange('channel_type', e.target.value)}
                  className="form-select"
                >
                  <option value="clone">Clonar Posts</option>
                  <option value="forward">Encaminhar (Forward)</option>
                  <option value="spy">Espionar (Ponte Premium)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ordem dos Posts</label>
                <select
                  value={form.post_order}
                  onChange={(e) => handleChange('post_order', e.target.value)}
                  className="form-select"
                >
                  <option value="fifo">FIFO (Primeiro a entrar)</option>
                  <option value="lifo">LIFO (Último a entrar)</option>
                  <option value="random">Aleatório</option>
                </select>
              </div>

              <div className="form-group">
                <label>Intervalo (minutos)</label>
                <input
                  type="number"
                  min="1"
                  value={form.interval_minutes}
                  onChange={(e) => handleChange('interval_minutes', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* ORIGEM → DESTINO */}
            <div className="form-section-label">Rota do Canal</div>
            <div className="form-row">
              <div className="form-group">
                <label>ID Canal Origem</label>
                <input
                  type="text"
                  placeholder="-1001234567890"
                  value={form.origin_channel_id}
                  onChange={(e) => handleChange('origin_channel_id', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Nome (apelido)</label>
                <input
                  type="text"
                  placeholder="Ex: Canal Concorrente X"
                  value={form.origin_channel_name}
                  onChange={(e) => handleChange('origin_channel_name', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-route-arrow">
              <ArrowRight size={20} />
              <span>encaminha para</span>
              <ArrowRight size={20} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ID Canal Destino</label>
                <input
                  type="text"
                  placeholder="-1009876543210"
                  value={form.dest_channel_id}
                  onChange={(e) => handleChange('dest_channel_id', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Nome (apelido)</label>
                <input
                  type="text"
                  placeholder="Ex: Meu Canal VIP"
                  value={form.dest_channel_name}
                  onChange={(e) => handleChange('dest_channel_name', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* AGENDAMENTO */}
            <div className="form-section-label">Agendamento (opcional)</div>
            <div className="form-row">
              <div className="form-group">
                <label>Início do Horário</label>
                <input
                  type="time"
                  value={form.schedule_start}
                  onChange={(e) => handleChange('schedule_start', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Fim do Horário</label>
                <input
                  type="time"
                  value={form.schedule_end}
                  onChange={(e) => handleChange('schedule_end', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <span className="field-hint">Deixe vazio para funcionar 24h. Horário de Brasília.</span>

            {/* SUBSTITUIÇÃO DE CTA */}
            <div className="form-section-label">Substituição de CTA (opcional)</div>
            <div className="form-row">
              <div className="form-group">
                <label>Buscar (texto/link original)</label>
                <input
                  type="text"
                  placeholder="https://link-do-concorrente.com"
                  value={form.cta_find}
                  onChange={(e) => handleChange('cta_find', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Substituir por</label>
                <input
                  type="text"
                  placeholder="https://meu-link.com"
                  value={form.cta_replace}
                  onChange={(e) => handleChange('cta_replace', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <span className="field-hint">O sistema trocará automaticamente o link/CTA nos posts clonados.</span>

            {/* BOTÃO SALVAR */}
            <button type="submit" className="canais-submit-btn" disabled={saving}>
              {saving ? (
                <><Loader2 size={18} className="spin" /> Salvando...</>
              ) : (
                <><Plus size={18} /> Criar Configuração</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* LISTA DE CANAIS */}
      <div className="canais-list-section">
        <h2><Layers size={20} /> Configurações Ativas ({channels.length})</h2>

        {channels.length === 0 ? (
          <div className="canais-empty">
            <Layers size={40} strokeWidth={1} />
            <p>Nenhum canal configurado ainda.</p>
            <span>Clique em "Novo Canal" para criar sua primeira rota de automação.</span>
          </div>
        ) : (
          <div className="canais-cards-grid">
            {channels.map((canal) => (
              <div key={canal.id} className={`canal-card ${canal.is_active ? '' : 'inactive'}`}>

                {/* HEADER DO CARD */}
                <div className="canal-card-header">
                  <div className="canal-card-type">
                    <span className={`type-badge ${canal.channel_type}`}>
                      {channelTypeLabels[canal.channel_type] || canal.channel_type}
                    </span>
                    {canal.bot_name && (
                      <span className="bot-badge">
                        <Bot size={12} /> @{canal.bot_username}
                      </span>
                    )}
                  </div>
                  <div className={`canal-card-status ${canal.is_active ? 'active' : 'off'}`}>
                    {canal.is_active ? 'Ativo' : 'Pausado'}
                  </div>
                </div>

                {/* ROTA VISUAL */}
                <div className="canal-card-route">
                  <div className="route-block origin">
                    <span className="route-block-label">ORIGEM</span>
                    <span className="route-block-name">{canal.origin_channel_name || 'Sem nome'}</span>
                    <span className="route-block-id">
                      {canal.origin_channel_id}
                      <button className="copy-btn-sm" onClick={() => copyToClipboard(canal.origin_channel_id)} title="Copiar">
                        <Copy size={11} />
                      </button>
                    </span>
                  </div>
                  <div className="route-arrow-mid">
                    <ArrowRight size={18} />
                  </div>
                  <div className="route-block dest">
                    <span className="route-block-label">DESTINO</span>
                    <span className="route-block-name">{canal.dest_channel_name || 'Sem nome'}</span>
                    <span className="route-block-id">
                      {canal.dest_channel_id}
                      <button className="copy-btn-sm" onClick={() => copyToClipboard(canal.dest_channel_id)} title="Copiar">
                        <Copy size={11} />
                      </button>
                    </span>
                  </div>
                </div>

                {/* DETALHES */}
                <div className="canal-card-details">
                  <div className="detail-item">
                    <Clock size={13} />
                    <span>A cada {canal.interval_minutes}min</span>
                  </div>
                  <div className="detail-item">
                    <Repeat size={13} />
                    <span>{postOrderLabels[canal.post_order] || canal.post_order}</span>
                  </div>
                  {canal.schedule_start && canal.schedule_end && (
                    <div className="detail-item">
                      <Clock size={13} />
                      <span>{canal.schedule_start} — {canal.schedule_end}</span>
                    </div>
                  )}
                  {canal.cta_find && (
                    <div className="detail-item">
                      <MessageSquare size={13} />
                      <span>CTA: substituindo link</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <Layers size={13} />
                    <span>{canal.total_forwarded} enviados</span>
                  </div>
                </div>

                {/* AÇÕES */}
                <div className="canal-card-actions">
                  <button
                    className={`canal-toggle-btn ${canal.is_active ? 'active' : ''}`}
                    onClick={() => handleToggle(canal.id)}
                  >
                    {canal.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                    {canal.is_active ? 'Pausar' : 'Ativar'}
                  </button>
                  <button
                    className="canal-delete-btn"
                    onClick={() => handleDelete(canal.id, canal.origin_channel_name || canal.origin_channel_id)}
                  >
                    <Trash2 size={14} /> Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}