import React, { useEffect, useState } from 'react';
import { botService } from '../services/api';
import {
  Bot, Plus, Trash2, CheckCircle, AlertCircle, Loader2,
  ArrowRight, Radio, Send, Copy, Eye, EyeOff
} from 'lucide-react';
import './GerenciarBots.css';

export function GerenciarBots() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tokenVisible, setTokenVisible] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Campos do formulário
  const [form, setForm] = useState({
    bot_token: '',
    origin_channel_id: '',
    dest_channel_id: '',
  });

  // Estado de validação em tempo real do token
  const [tokenStatus, setTokenStatus] = useState(null); // null | 'validating' | 'valid' | 'invalid'
  const [botPreview, setBotPreview] = useState(null); // {name, username}

  useEffect(() => {
    carregarBots();
  }, []);

  // ==========================================
  // CARREGAR LISTA DE BOTS
  // ==========================================
  const carregarBots = async () => {
    try {
      const data = await botService.list();
      setBots(data);
    } catch (error) {
      console.error('Erro ao carregar bots:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VALIDAÇÃO DO TOKEN EM TEMPO REAL
  // ==========================================
  useEffect(() => {
    // Só valida se parecer um token real (formato: 123456:ABC-DEF...)
    const tokenRegex = /^\d{8,}:[A-Za-z0-9_-]{30,}$/;
    if (!tokenRegex.test(form.bot_token)) {
      setTokenStatus(null);
      setBotPreview(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setTokenStatus('validating');
      try {
        const preview = await botService.validate(form.bot_token);
        if (preview && preview.ok) {
          setTokenStatus('valid');
          setBotPreview({
            name: preview.result.first_name,
            username: preview.result.username,
          });
        } else {
          setTokenStatus('invalid');
          setBotPreview(null);
        }
      } catch {
        setTokenStatus('invalid');
        setBotPreview(null);
      }
    }, 800); // debounce de 800ms

    return () => clearTimeout(timeout);
  }, [form.bot_token]);

  // ==========================================
  // CRIAR NOVO BOT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bot_token || !form.origin_channel_id || !form.dest_channel_id) {
      showFeedback('Preencha todos os campos!', 'error');
      return;
    }
    if (tokenStatus !== 'valid') {
      showFeedback('Aguarde a validação do token ou verifique se está correto.', 'error');
      return;
    }

    setSaving(true);
    try {
      await botService.create(form);
      showFeedback('Bot cadastrado com sucesso!', 'success');
      setForm({ bot_token: '', origin_channel_id: '', dest_channel_id: '' });
      setTokenStatus(null);
      setBotPreview(null);
      carregarBots();
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erro ao cadastrar bot.';
      showFeedback(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETAR BOT
  // ==========================================
  const handleDelete = async (botId, botName) => {
    if (!window.confirm(`Tem certeza que deseja remover o bot "${botName}"?`)) return;
    try {
      await botService.remove(botId);
      showFeedback('Bot removido com sucesso!', 'success');
      carregarBots();
    } catch {
      showFeedback('Erro ao remover bot.', 'error');
    }
  };

  // ==========================================
  // FEEDBACK VISUAL
  // ==========================================
  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showFeedback('Copiado!', 'success');
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (loading) {
    return (
      <div className="bots-loading">
        <Loader2 size={24} className="spin" />
        <p>Carregando bots configurados...</p>
      </div>
    );
  }

  return (
    <div className="bots-container">

      {/* HEADER */}
      <div className="bots-header">
        <div className="bots-header-text">
          <h1><Bot size={28} /> Gerenciar Bots</h1>
          <p>Configure seus Bots Oficiais (BotFather) para a estrutura de Canal Ponte.</p>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div className={`bots-toast ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* FORMULÁRIO DE CADASTRO */}
      <div className="bots-form-card">
        <div className="bots-form-title">
          <Plus size={20} />
          <h2>Cadastrar Novo Bot</h2>
        </div>
        <p className="bots-form-subtitle">
          Cole o Token do BotFather e o sistema validará automaticamente. Depois informe os IDs dos canais de origem e destino.
        </p>

        <form onSubmit={handleSubmit} className="bots-form">

          {/* TOKEN DO BOT */}
          <div className="form-group">
            <label>Token do Bot (BotFather)</label>
            <div className="token-input-wrapper">
              <input
                type={tokenVisible ? 'text' : 'password'}
                placeholder="123456789:ABCdefGHIjklmNOPqrs..."
                value={form.bot_token}
                onChange={(e) => handleChange('bot_token', e.target.value)}
                className={`form-input token-input ${
                  tokenStatus === 'valid' ? 'input-valid' : 
                  tokenStatus === 'invalid' ? 'input-invalid' : ''
                }`}
              />
              <button
                type="button"
                className="token-toggle"
                onClick={() => setTokenVisible(!tokenVisible)}
                title={tokenVisible ? 'Ocultar token' : 'Mostrar token'}
              >
                {tokenVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <div className="token-status-icon">
                {tokenStatus === 'validating' && <Loader2 size={16} className="spin" />}
                {tokenStatus === 'valid' && <CheckCircle size={16} color="#22c55e" />}
                {tokenStatus === 'invalid' && <AlertCircle size={16} color="#ef4444" />}
              </div>
            </div>

            {/* Preview do Bot */}
            {botPreview && tokenStatus === 'valid' && (
              <div className="bot-preview">
                <Bot size={16} />
                <span><strong>{botPreview.name}</strong> — @{botPreview.username}</span>
              </div>
            )}
            {tokenStatus === 'invalid' && (
              <span className="field-error">Token inválido. Verifique no @BotFather.</span>
            )}
          </div>

          {/* CANAL DE ORIGEM E DESTINO */}
          <div className="form-row">
            <div className="form-group">
              <label>ID do Canal de Origem</label>
              <input
                type="text"
                placeholder="-1001234567890"
                value={form.origin_channel_id}
                onChange={(e) => handleChange('origin_channel_id', e.target.value)}
                className="form-input"
              />
              <span className="field-hint">Canal oculto onde o Userbot publica (Premium)</span>
            </div>

            <div className="form-arrow">
              <ArrowRight size={20} />
            </div>

            <div className="form-group">
              <label>ID do Canal de Destino</label>
              <input
                type="text"
                placeholder="-1009876543210"
                value={form.dest_channel_id}
                onChange={(e) => handleChange('dest_channel_id', e.target.value)}
                className="form-input"
              />
              <span className="field-hint">Canal/Grupo VIP para onde o bot encaminha</span>
            </div>
          </div>

          {/* BOTÃO SALVAR */}
          <button type="submit" className="bots-submit-btn" disabled={saving || tokenStatus !== 'valid'}>
            {saving ? (
              <><Loader2 size={18} className="spin" /> Salvando...</>
            ) : (
              <><Send size={18} /> Cadastrar Bot</>
            )}
          </button>
        </form>
      </div>

      {/* LISTA DE BOTS CADASTRADOS */}
      <div className="bots-list-section">
        <h2><Radio size={20} /> Bots Cadastrados ({bots.length})</h2>

        {bots.length === 0 ? (
          <div className="bots-empty">
            <Bot size={40} strokeWidth={1} />
            <p>Nenhum bot cadastrado ainda.</p>
            <span>Use o formulário acima para adicionar o seu primeiro bot.</span>
          </div>
        ) : (
          <div className="bots-cards-grid">
            {bots.map((bot) => (
              <div key={bot.id} className="bot-card">
                <div className="bot-card-header">
                  <div className="bot-card-icon">
                    <Bot size={22} />
                  </div>
                  <div className="bot-card-info">
                    <h3>{bot.bot_name}</h3>
                    <span className="bot-username">@{bot.bot_username}</span>
                  </div>
                  <div className={`bot-card-status ${bot.is_active ? 'active' : 'inactive'}`}>
                    {bot.is_active ? 'Ativo' : 'Inativo'}
                  </div>
                </div>

                <div className="bot-card-route">
                  <div className="route-point origin">
                    <span className="route-label">Origem</span>
                    <span className="route-id" title={bot.origin_channel_id}>
                      {bot.origin_channel_id}
                      <button 
                        className="copy-btn" 
                        onClick={() => copyToClipboard(bot.origin_channel_id)}
                        title="Copiar ID"
                      >
                        <Copy size={12} />
                      </button>
                    </span>
                  </div>
                  <div className="route-arrow">
                    <ArrowRight size={16} />
                  </div>
                  <div className="route-point dest">
                    <span className="route-label">Destino</span>
                    <span className="route-id" title={bot.dest_channel_id}>
                      {bot.dest_channel_id}
                      <button 
                        className="copy-btn" 
                        onClick={() => copyToClipboard(bot.dest_channel_id)}
                        title="Copiar ID"
                      >
                        <Copy size={12} />
                      </button>
                    </span>
                  </div>
                </div>

                <div className="bot-card-actions">
                  <button
                    className="bot-delete-btn"
                    onClick={() => handleDelete(bot.id, bot.bot_name)}
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