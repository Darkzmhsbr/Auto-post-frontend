import React, { useEffect, useState, useRef } from 'react';
import { channelService, botService } from '../services/api';
import {
  Layers, Plus, Trash2, CheckCircle, AlertCircle, Loader2,
  ArrowRight, Power, PowerOff, Clock, Repeat, Bot,
  MessageSquare, Copy, Bold, Italic, Underline, Strikethrough,
  Code, Quote, Link as LinkIcon, Type, PlusCircle, Target, Edit3, X, Save, Hash
} from 'lucide-react';
import { PremiumEmojiPicker } from '../components/PremiumEmojiPicker'; // 🌟 IMPORT DO COMPONENTE PREMIUM EMOJI
import './GerenciarCanais.css';


const INITIAL_FORM = {
  bot_id: '', origin_channel_id: '', origin_channel_name: '',
  dest_channel_id: '', dest_channel_name: '', channel_type: 'clone',
  interval_minutes: 30, schedule_start: '', schedule_end: '',
  post_order: 'fifo', cta_find: '', cta_replace: '', cta_mode: 'exact',
  custom_caption: '', use_custom_caption: false, caption_mode: 'replace',
  userbot_required: true, // 🌟 MODO "SÓ BOT"
  auto_topic_clone: false, // 🌟 NOVO: ESPELHAMENTO INTELIGENTE DE TÓPICOS
};

export function GerenciarCanais() {
  const [channels, setChannels] = useState([]);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = criando, number = editando
  const [feedback, setFeedback] = useState(null);
  const [extraDests, setExtraDests] = useState([]);
  const [newDestId, setNewDestId] = useState('');
  const [newDestName, setNewDestName] = useState('');
  const captionRef = useRef(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });

  // 🌟 ESTADOS PARA MAPEAMENTO DE TÓPICOS
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [channelTopics, setChannelTopics] = useState([]);
  const [topicOriginId, setTopicOriginId] = useState('');
  const [topicDestId, setTopicDestId] = useState('');

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [canaisData, botsData] = await Promise.all([channelService.list(), botService.list()]);
      setChannels(canaisData);
      setBots(botsData);
    } catch (error) { console.error('Erro ao carregar dados:', error); }
    finally { setLoading(false); }
  };

  // ==========================================
  // ABRIR FORMULÁRIO (CRIAR ou EDITAR)
  // ==========================================
  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...INITIAL_FORM });
    setExtraDests([]);
    setShowForm(true);
  };

  const openEditForm = (canal) => {
    setEditingId(canal.id);
    setForm({
      bot_id: canal.bot_id || '',
      origin_channel_id: String(canal.origin_channel_id),
      origin_channel_name: canal.origin_channel_name || '',
      dest_channel_id: String(canal.dest_channel_id),
      dest_channel_name: canal.dest_channel_name || '',
      channel_type: canal.channel_type || 'clone',
      interval_minutes: canal.interval_minutes || 30,
      schedule_start: canal.schedule_start || '',
      schedule_end: canal.schedule_end || '',
      post_order: canal.post_order || 'fifo',
      cta_find: canal.cta_find || '',
      cta_replace: canal.cta_replace || '',
      cta_mode: canal.cta_mode || 'exact',
      custom_caption: canal.custom_caption || '',
      use_custom_caption: canal.use_custom_caption || false,
      caption_mode: canal.caption_mode || 'replace',
      userbot_required: canal.userbot_required !== false,
      auto_topic_clone: canal.auto_topic_clone || false, // 🌟 CARREGA O ESTADO DO ESPELHAMENTO DE TÓPICOS
    });
    setExtraDests([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...INITIAL_FORM });
    setExtraDests([]);
  };

  // ==========================================
  // FORMATAÇÃO DE LEGENDA
  // ==========================================
  const applyFormat = (tagStart, tagEnd) => {
    const textarea = captionRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.custom_caption || '';
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + tagStart + selected + tagEnd + text.substring(end);
    handleChange('custom_caption', newText);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(end + tagStart.length + tagEnd.length, end + tagStart.length + tagEnd.length); }, 0);
  };

  const addLinkFormat = () => {
    const url = prompt("Digite a URL:", "https://");
    if (url) applyFormat(`<a href="${url}">`, '</a>');
  };

  // ==========================================
  // LÓGICA DE TÓPICOS (CRUD MANUAL) 🌟
  // ==========================================
  const handleToggleTopics = async (channelId) => {
    if (expandedTopicId === channelId) {
      setExpandedTopicId(null);
    } else {
      setExpandedTopicId(channelId);
      try {
        const topics = await channelService.listTopics(channelId);
        setChannelTopics(topics);
      } catch (error) { showFeedbackMsg('Erro ao carregar tópicos.', 'error'); }
    }
  };

  const handleAddTopic = async (channelId) => {
    if (!topicOriginId || !topicDestId) return;
    try {
      await channelService.addTopic(channelId, { origin_topic_id: parseInt(topicOriginId), dest_topic_id: parseInt(topicDestId) });
      const topics = await channelService.listTopics(channelId);
      setChannelTopics(topics);
      setTopicOriginId(''); setTopicDestId('');
      showFeedbackMsg('Tópico mapeado com sucesso!', 'success');
    } catch (error) { showFeedbackMsg('Erro ao mapear tópico.', 'error'); }
  };

  const handleRemoveTopic = async (channelId, topicId) => {
    try {
      await channelService.removeTopic(channelId, topicId);
      const topics = await channelService.listTopics(channelId);
      setChannelTopics(topics);
      showFeedbackMsg('Mapeamento removido!', 'success');
    } catch (error) { showFeedbackMsg('Erro ao remover tópico.', 'error'); }
  };

  // ==========================================
  // DESTINOS EXTRAS (formulário)
  // ==========================================
  const handleAddExtraDest = () => {
    if (!newDestId) return;
    setExtraDests(prev => [...prev, { dest_channel_id: parseInt(newDestId), dest_channel_name: newDestName || `Destino #${prev.length + 2}` }]);
    setNewDestId(''); setNewDestName('');
  };
  const handleRemoveExtraDest = (index) => setExtraDests(prev => prev.filter((_, i) => i !== index));

  const handleAddDestToChannel = async (channelId) => {
    const destId = prompt("ID do novo canal de destino:");
    if (!destId) return;
    const destName = prompt("Apelido (opcional):", "");
    try {
      await channelService.addDestination(channelId, { dest_channel_id: parseInt(destId), dest_channel_name: destName || 'Destino extra' });
      showFeedbackMsg('Destino adicionado!', 'success'); carregarDados();
    } catch (error) { showFeedbackMsg(error.response?.data?.detail || 'Erro ao adicionar destino.', 'error'); }
  };

  const handleRemoveDestFromChannel = async (channelId, destId, destName) => {
    if (!window.confirm(`Remover destino "${destName}"?`)) return;
    try { await channelService.removeDestination(channelId, destId); showFeedbackMsg('Destino removido!', 'success'); carregarDados(); }
    catch { showFeedbackMsg('Erro ao remover destino.', 'error'); }
  };

  // ==========================================
  // SUBMIT (CRIAR ou EDITAR)
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.origin_channel_id || !form.dest_channel_id) {
      showFeedbackMsg('Preencha os IDs de origem e destino principal!', 'error'); return;
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
        custom_caption: form.custom_caption || null,
        userbot_required: form.userbot_required,
        auto_topic_clone: form.auto_topic_clone, // 🌟 ENVIANDO O NOVO STATUS
      };

      if (editingId) {
        // EDITAR
        await channelService.update(editingId, payload);
        showFeedbackMsg('Configuração atualizada!', 'success');
      } else {
        // CRIAR
        payload.extra_destinations = extraDests.length > 0 ? extraDests : null;
        await channelService.create(payload);
        showFeedbackMsg('Canal configurado com sucesso!', 'success');
      }

      closeForm();
      carregarDados();
    } catch (error) {
      showFeedbackMsg(error.response?.data?.detail || 'Erro ao salvar.', 'error');
    } finally { setSaving(false); }
  };

  const handleToggle = async (channelId) => {
    try { const r = await channelService.toggle(channelId); showFeedbackMsg(r.message, 'success'); carregarDados(); }
    catch { showFeedbackMsg('Erro ao alterar status.', 'error'); }
  };

  const handleDelete = async (channelId, name) => {
    if (!window.confirm(`Remover a configuração "${name}"?`)) return;
    try { await channelService.remove(channelId); showFeedbackMsg('Canal removido!', 'success'); carregarDados(); }
    catch { showFeedbackMsg('Erro ao remover canal.', 'error'); }
  };

  const showFeedbackMsg = (message, type) => { setFeedback({ message, type }); setTimeout(() => setFeedback(null), 4000); };
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const copyToClipboard = (text) => { navigator.clipboard.writeText(String(text)); showFeedbackMsg('ID copiado!', 'success'); };

  const channelTypeLabels = { clone: 'Clonar Posts', forward: 'Encaminhar', spy: 'Espionar (Ponte)' };
  const postOrderLabels = { fifo: 'FIFO (Primeiro a entrar)', lifo: 'LIFO (Último a entrar)', random: 'Aleatório' };

  if (loading) return (<div className="canais-loading"><Loader2 size={24} className="spin" /><p>Carregando canais configurados...</p></div>);

  return (
    <div className="canais-container">
      <div className="canais-header">
        <div className="canais-header-text">
          <h1><Layers size={28} /> Canais / Pontes</h1>
          <p>Configure as rotas de clonagem e encaminhamento entre canais do Telegram.</p>
        </div>
        <button className="canais-add-btn" onClick={showForm ? closeForm : openCreateForm}>
          {showForm ? <><X size={18} /> Cancelar</> : <><Plus size={18} /> Novo Canal</>}
        </button>
      </div>

      {feedback && (
        <div className={`canais-toast ${feedback.type}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ==================== FORMULÁRIO (CRIAR / EDITAR) ==================== */}
      {showForm && (
        <div className="canais-form-card">
          <div className="canais-form-title">
            {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
            <h2>{editingId ? 'Editar Configuração' : 'Nova Configuração de Canal'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="canais-form">
            {bots.length > 0 && (
              <div className="form-group">
                <label>Bot Vinculado (Ponte)</label>
                <select value={form.bot_id} onChange={(e) => handleChange('bot_id', e.target.value)} className="form-select">
                  <option value="">Nenhum (usar Userbot direto)</option>
                  {bots.map((bot) => (<option key={bot.id} value={bot.id}>{bot.bot_name} — @{bot.bot_username}</option>))}
                </select>
              </div>
            )}

            {/* 🌟 MODO SÓ BOT (Toggle do Userbot) */}
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label>Conexão da Conta</label>
              <div className="caption-toggle" style={{ marginTop: '4px' }}>
                <label className="toggle-label">
                  <input type="checkbox" checked={form.userbot_required} onChange={(e) => handleChange('userbot_required', e.target.checked)} />
                  <span className="toggle-slider"></span><span>Exigir Sessão do Userbot (Conta Pessoal)</span>
                </label>
              </div>
              <span className="field-hint">Desative se quiser usar APENAS o Bot Oficial (sem conectar seu número na plataforma). Útil se o bot já for Admin de ambos os canais.</span>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Tipo de Operação</label>
                <select value={form.channel_type} onChange={(e) => handleChange('channel_type', e.target.value)} className="form-select">
                  <option value="clone">Clonar Posts</option><option value="forward">Encaminhar (Forward)</option><option value="spy">Espionar (Ponte Premium)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ordem dos Posts</label>
                <select value={form.post_order} onChange={(e) => handleChange('post_order', e.target.value)} className="form-select">
                  <option value="fifo">FIFO (Primeiro a entrar)</option><option value="lifo">LIFO (Último a entrar)</option><option value="random">Aleatório</option>
                </select>
              </div>
              <div className="form-group">
                <label>Intervalo (minutos)</label>
                <input type="number" min="1" value={form.interval_minutes} onChange={(e) => handleChange('interval_minutes', e.target.value)} className="form-input" />
              </div>
            </div>

            <div className="form-section-label">Rota do Canal</div>
            <div className="form-row">
              <div className="form-group"><label>ID Canal Origem</label><input type="text" placeholder="-1001234567890" value={form.origin_channel_id} onChange={(e) => handleChange('origin_channel_id', e.target.value)} className="form-input" /></div>
              <div className="form-group"><label>Nome (apelido)</label><input type="text" placeholder="Ex: Canal Concorrente X" value={form.origin_channel_name} onChange={(e) => handleChange('origin_channel_name', e.target.value)} className="form-input" /></div>
            </div>
            <div className="form-route-arrow"><ArrowRight size={20} /><span>encaminha para</span><ArrowRight size={20} /></div>
            <div className="form-row">
              <div className="form-group"><label>ID Canal Destino (principal)</label><input type="text" placeholder="-1009876543210" value={form.dest_channel_id} onChange={(e) => handleChange('dest_channel_id', e.target.value)} className="form-input" /></div>
              <div className="form-group"><label>Nome (apelido)</label><input type="text" placeholder="Ex: Meu Canal VIP" value={form.dest_channel_name} onChange={(e) => handleChange('dest_channel_name', e.target.value)} className="form-input" /></div>
            </div>

            {/* DESTINOS EXTRAS (apenas na criação) */}
            {!editingId && (
              <>
                <div className="form-section-label">Destinos Adicionais (opcional)</div>
                <span className="field-hint" style={{ marginBottom: '8px', display: 'block' }}>O mesmo conteúdo será enviado para todos os destinos.</span>
                {extraDests.length > 0 && (
                  <div className="extra-dests-list">
                    {extraDests.map((d, i) => (
                      <div key={i} className="extra-dest-item"><Target size={14} /><span className="extra-dest-name">{d.dest_channel_name}</span><span className="extra-dest-id">{d.dest_channel_id}</span>
                        <button type="button" className="extra-dest-remove" onClick={() => handleRemoveExtraDest(i)}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="form-row" style={{ alignItems: 'flex-end' }}>
                  <div className="form-group"><label>ID do Destino Extra</label><input type="text" placeholder="-100..." value={newDestId} onChange={(e) => setNewDestId(e.target.value)} className="form-input" /></div>
                  <div className="form-group"><label>Apelido</label><input type="text" placeholder="Ex: Canal Free" value={newDestName} onChange={(e) => setNewDestName(e.target.value)} className="form-input" /></div>
                  <button type="button" className="add-dest-btn" onClick={handleAddExtraDest} disabled={!newDestId}><PlusCircle size={16} /> Adicionar</button>
                </div>
              </>
            )}

            {/* AGENDAMENTO */}
            <div className="form-section-label">Agendamento (opcional)</div>
            <div className="form-row">
              <div className="form-group"><label>Início do Horário</label><input type="time" value={form.schedule_start} onChange={(e) => handleChange('schedule_start', e.target.value)} className="form-input" /></div>
              <div className="form-group"><label>Fim do Horário</label><input type="time" value={form.schedule_end} onChange={(e) => handleChange('schedule_end', e.target.value)} className="form-input" /></div>
            </div>
            <span className="field-hint">Deixe vazio para funcionar 24h. Horário de Brasília.</span>

            {/* CTA com MODO INTELIGENTE */}
            <div className="form-section-label">Substituição de CTA (opcional)</div>
            <div className="cta-mode-selector">
              <label className={`cta-mode-option ${form.cta_mode === 'exact' ? 'active' : ''}`}>
                <input type="radio" name="cta_mode" value="exact" checked={form.cta_mode === 'exact'} onChange={(e) => handleChange('cta_mode', e.target.value)} />
                <span className="cta-mode-title">Busca Exata</span>
                <span className="cta-mode-desc">Substitui apenas o link idêntico ao informado</span>
              </label>
              <label className={`cta-mode-option ${form.cta_mode === 'smart' ? 'active' : ''}`}>
                <input type="radio" name="cta_mode" value="smart" checked={form.cta_mode === 'smart'} onChange={(e) => handleChange('cta_mode', e.target.value)} />
                <span className="cta-mode-title">Inteligente</span>
                <span className="cta-mode-desc">Detecta TODOS os links t.me/ nas postagens e substitui</span>
              </label>
            </div>

            {form.cta_mode === 'exact' && (
              <div className="form-row">
                <div className="form-group"><label>Buscar (link original)</label><input type="text" placeholder="https://t.me/BotConcorrente?start=xxx" value={form.cta_find} onChange={(e) => handleChange('cta_find', e.target.value)} className="form-input" /></div>
                <div className="form-group"><label>Substituir por</label><input type="text" placeholder="https://t.me/MeuBot?start=xxx" value={form.cta_replace} onChange={(e) => handleChange('cta_replace', e.target.value)} className="form-input" /></div>
              </div>
            )}
            {form.cta_mode === 'smart' && (
              <div className="form-group">
                <label>Seu link de CTA (substituirá TODOS os links encontrados)</label>
                <input type="text" placeholder="https://t.me/MeuBot?start=xxx" value={form.cta_replace} onChange={(e) => handleChange('cta_replace', e.target.value)} className="form-input" />
                <span className="field-hint">O sistema encontrará automaticamente todos os links t.me/ em cada postagem e trocará pelo seu.</span>
              </div>
            )}

            {/* LEGENDA PERSONALIZADA (só clone) */}
            {form.channel_type === 'clone' && (
              <>
                <div className="form-section-label"><Type size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Legenda Personalizada (opcional)</div>
                <div className="caption-toggle">
                  <label className="toggle-label">
                    <input type="checkbox" checked={form.use_custom_caption} onChange={(e) => handleChange('use_custom_caption', e.target.checked)} />
                    <span className="toggle-slider"></span><span>Ativar legenda personalizada</span>
                  </label>
                  {form.use_custom_caption && (
                    <select value={form.caption_mode} onChange={(e) => handleChange('caption_mode', e.target.value)} className="form-select caption-mode-select">
                      <option value="replace">Substituir legenda original</option><option value="append">Adicionar abaixo da original</option>
                    </select>
                  )}
                </div>
                {form.use_custom_caption && (
                  <div className="caption-editor">
                    <div className="caption-toolbar">
                      {/* 🌟 INTEGRAÇÃO DO COMPONENTE PREMIUM EMOJI */}
                      <PremiumEmojiPicker compact={true} onSelect={(emoji) => {
                        const textarea = captionRef.current;
                        if (!textarea) return;
                        const start = textarea.selectionStart;
                        const text = form.custom_caption || '';
                        const newText = text.substring(0, start) + emoji + text.substring(textarea.selectionEnd);
                        handleChange('custom_caption', newText);
                        setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
                      }} />
                      <span className="toolbar-sep"></span>
                      <button type="button" onClick={() => applyFormat('<b>', '</b>')} title="Negrito"><Bold size={14} /></button>
                      <button type="button" onClick={() => applyFormat('<i>', '</i>')} title="Itálico"><Italic size={14} /></button>
                      <button type="button" onClick={() => applyFormat('<u>', '</u>')} title="Sublinhado"><Underline size={14} /></button>
                      <button type="button" onClick={() => applyFormat('<s>', '</s>')} title="Tachado"><Strikethrough size={14} /></button>
                      <span className="toolbar-sep"></span>
                      <button type="button" onClick={() => applyFormat('<code>', '</code>')} title="Mono"><Code size={14} /></button>
                      <button type="button" onClick={() => applyFormat('<blockquote>', '</blockquote>')} title="Citação"><Quote size={14} /></button>
                      <button type="button" onClick={addLinkFormat} title="Link"><LinkIcon size={14} /></button>
                    </div>
                    <textarea ref={captionRef} className="caption-textarea" value={form.custom_caption} onChange={(e) => handleChange('custom_caption', e.target.value)} placeholder="Legenda com formatação HTML do Telegram..." rows={4} />
                    <span className="field-hint">Suporta: &lt;b&gt;negrito&lt;/b&gt;, &lt;i&gt;itálico&lt;/i&gt;, &lt;u&gt;sublinhado&lt;/u&gt;, &lt;s&gt;tachado&lt;/s&gt;, &lt;code&gt;mono&lt;/code&gt;, &lt;a href="url"&gt;link&lt;/a&gt;</span>
                  </div>
                )}
              </>
            )}

            {/* 🌟 ESPELHAMENTO DE TÓPICOS INTELIGENTE */}
            <div className="form-section-label" style={{ marginTop: '24px' }}><Hash size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Fóruns e Tópicos (opcional)</div>
            <div className="caption-toggle" style={{ marginTop: '8px' }}>
              <label className="toggle-label">
                <input type="checkbox" checked={form.auto_topic_clone} onChange={(e) => handleChange('auto_topic_clone', e.target.checked)} />
                <span className="toggle-slider"></span><span>Espelhar Tópicos Automaticamente</span>
              </label>
            </div>
            <span className="field-hint" style={{ display: 'block', marginTop: '4px' }}>Se a origem for um grupo com tópicos, o sistema criará os tópicos no destino (se não existirem) e enviará as postagens preservando a estrutura original.</span>

            <button type="submit" className="canais-submit-btn" style={{ marginTop: '24px' }} disabled={saving}>
              {saving ? (<><Loader2 size={18} className="spin" /> Salvando...</>) : editingId ? (<><Save size={18} /> Salvar Alterações</>) : (<><Plus size={18} /> Criar Configuração</>)}
            </button>
          </form>
        </div>
      )}

      {/* ==================== LISTA DE CANAIS ==================== */}
      <div className="canais-list-section">
        <h2><Layers size={20} /> Configurações Ativas ({channels.length})</h2>
        {channels.length === 0 ? (
          <div className="canais-empty"><Layers size={40} strokeWidth={1} /><p>Nenhum canal configurado ainda.</p><span>Clique em "Novo Canal" para criar sua primeira rota.</span></div>
        ) : (
          <div className="canais-cards-grid">
            {channels.map((canal) => (
              <div key={canal.id} className={`canal-card ${canal.is_active ? '' : 'inactive'}`}>
                <div className="canal-card-header">
                  <div className="canal-card-type">
                    <span className={`type-badge ${canal.channel_type}`}>{channelTypeLabels[canal.channel_type] || canal.channel_type}</span>
                    {canal.bot_name && (<span className="bot-badge"><Bot size={12} /> @{canal.bot_username}</span>)}
                    {canal.use_custom_caption && (<span className="caption-badge"><Type size={11} /> Legenda</span>)}
                    {canal.cta_mode === 'smart' && (<span className="smart-badge">⚡ CTA Smart</span>)}
                  </div>
                  <div className={`canal-card-status ${canal.is_active ? 'active' : 'off'}`}>{canal.is_active ? 'Ativo' : 'Pausado'}</div>
                </div>

                <div className="canal-card-route">
                  <div className="route-block origin">
                    <span className="route-block-label">ORIGEM</span>
                    <span className="route-block-name">{canal.origin_channel_name || 'Sem nome'}</span>
                    <span className="route-block-id">{canal.origin_channel_id}<button className="copy-btn-sm" onClick={() => copyToClipboard(canal.origin_channel_id)}><Copy size={11} /></button></span>
                  </div>
                  <div className="route-arrow-mid"><ArrowRight size={18} /></div>
                  <div className="route-block dest">
                    <span className="route-block-label">DESTINO PRINCIPAL</span>
                    <span className="route-block-name">{canal.dest_channel_name || 'Sem nome'}</span>
                    <span className="route-block-id">{canal.dest_channel_id}<button className="copy-btn-sm" onClick={() => copyToClipboard(canal.dest_channel_id)}><Copy size={11} /></button></span>
                  </div>
                </div>

                {canal.destinations && canal.destinations.length > 0 && (
                  <div className="extra-dests-card">
                    <span className="extra-dests-label"><Target size={12} /> +{canal.destinations.length} destino{canal.destinations.length > 1 ? 's' : ''} extra{canal.destinations.length > 1 ? 's' : ''}</span>
                    {canal.destinations.map((d) => (
                      <div key={d.id} className="extra-dest-card-item">
                        <span>{d.dest_channel_name}</span><span className="extra-dest-card-id">{d.dest_channel_id}</span>
                        <button className="extra-dest-card-remove" onClick={() => handleRemoveDestFromChannel(canal.id, d.id, d.dest_channel_name)}><Trash2 size={11} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="canal-card-details">
                  <div className="detail-item"><Clock size={13} /><span>A cada {canal.interval_minutes}min</span></div>
                  <div className="detail-item"><Repeat size={13} /><span>{postOrderLabels[canal.post_order] || canal.post_order}</span></div>
                  {canal.schedule_start && canal.schedule_end && (<div className="detail-item"><Clock size={13} /><span>{canal.schedule_start} — {canal.schedule_end}</span></div>)}
                  {canal.cta_replace && (<div className="detail-item"><MessageSquare size={13} /><span>CTA: {canal.cta_mode === 'smart' ? 'inteligente' : 'substituindo link'}</span></div>)}
                  <div className="detail-item"><Layers size={13} /><span>{canal.total_forwarded} enviados</span></div>
                  {(canal.destinations?.length > 0) && (<div className="detail-item"><Target size={13} /><span>{1 + canal.destinations.length} destinos</span></div>)}
                  {!canal.userbot_required && (<div className="detail-item"><Bot size={13} /><span>Apenas Bot Oficial</span></div>)}
                  {canal.auto_topic_clone && (<div className="detail-item"><Hash size={13} /><span>Tópicos Auto</span></div>)}
                </div>

                <div className="canal-card-actions">
                  <button className="canal-edit-btn" onClick={() => openEditForm(canal)}><Edit3 size={14} /> Editar</button>
                  <button className="canal-adddest-btn" onClick={() => handleAddDestToChannel(canal.id)}><PlusCircle size={14} /> Destino</button>
                  <button className="canal-adddest-btn" onClick={() => handleToggleTopics(canal.id)}><Hash size={14} /> Tópicos</button> {/* 🌟 BOTÃO TÓPICOS MANUAIS */}
                  <button className={`canal-toggle-btn ${canal.is_active ? 'active' : ''}`} onClick={() => handleToggle(canal.id)}>
                    {canal.is_active ? <PowerOff size={14} /> : <Power size={14} />}{canal.is_active ? 'Pausar' : 'Ativar'}
                  </button>
                  <button className="canal-delete-btn" onClick={() => handleDelete(canal.id, canal.origin_channel_name || canal.origin_channel_id)}><Trash2 size={14} /> Remover</button>
                </div>

                {/* 🌟 PAINEL INLINE DE MAPEAMENTO DE TÓPICOS */}
                {expandedTopicId === canal.id && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeUp 0.3s ease' }}>
                    <span className="extra-dests-label" style={{ color: '#8b5cf6' }}><Hash size={12} /> Mapeamento Manual de Tópicos</span>
                    
                    {channelTopics.length === 0 ? (
                      <span className="field-hint" style={{ fontSize: '0.78rem' }}>Nenhum tópico mapeado manualmente.</span>
                    ) : (
                      channelTopics.map(t => (
                        <div key={t.id} className="extra-dest-card-item" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#ccc' }}>Origem: <b style={{ fontFamily: 'monospace' }}>{t.origin_topic_id}</b></span>
                          <ArrowRight size={12} style={{ margin: '0 6px', color: '#666' }} />
                          <span style={{ fontSize: '0.8rem', color: '#ccc' }}>Destino: <b style={{ fontFamily: 'monospace' }}>{t.dest_topic_id}</b></span>
                          <button className="extra-dest-card-remove" style={{ marginLeft: 'auto' }} onClick={() => handleRemoveTopic(canal.id, t.id)} title="Remover Mapeamento"><Trash2 size={13} /></button>
                        </div>
                      ))
                    )}

                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <input type="number" placeholder="ID Origem (ex: 12)" className="form-input" style={{ padding: '8px 10px', fontSize: '0.8rem', flex: 1 }} value={topicOriginId} onChange={e => setTopicOriginId(e.target.value)} />
                      <input type="number" placeholder="ID Destino (ex: 5)" className="form-input" style={{ padding: '8px 10px', fontSize: '0.8rem', flex: 1 }} value={topicDestId} onChange={e => setTopicDestId(e.target.value)} />
                      <button className="add-dest-btn" style={{ height: 'auto', padding: '8px 14px' }} onClick={() => handleAddTopic(canal.id)} disabled={!topicOriginId || !topicDestId}><Plus size={14} /></button>
                    </div>
                    <span className="field-hint" style={{ fontSize: '0.7rem' }}>Use isso caso queira forçar uma postagem de um tópico X a ir para o tópico Y.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}