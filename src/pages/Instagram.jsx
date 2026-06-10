import React, { useEffect, useState, useRef } from 'react';
import {
  Instagram as IgIcon, Plus, Trash2, RefreshCw, Send, Clock, CheckCircle2,
  AlertCircle, XCircle, Eye, EyeOff, ChevronDown, ChevronUp,
  LogIn, Shield, Wifi, WifiOff, ListOrdered, History, X
} from 'lucide-react';
import { instagramService } from '../services/api';
import './Instagram.css';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const STATUS_LABEL = {
  ok:                 { label: 'Conectada',        color: '#22c55e', Icon: CheckCircle2 },
  pending:            { label: 'Pendente',          color: '#f59e0b', Icon: Clock },
  challenge_required: { label: 'Verificação',       color: '#f59e0b', Icon: Shield },
  bad_password:       { label: 'Senha errada',      color: '#ef4444', Icon: XCircle },
  error:              { label: 'Erro',              color: '#ef4444', Icon: AlertCircle },
};

const POST_STATUS_LABEL = {
  pending:    { label: 'Aguardando', color: '#f59e0b', Icon: Clock },
  processing: { label: 'Publicando', color: '#3b82f6', Icon: RefreshCw },
  done:       { label: 'Publicado',  color: '#22c55e', Icon: CheckCircle2 },
  error:      { label: 'Erro',       color: '#ef4444', Icon: XCircle },
};

const POST_TYPE_OPTIONS = [
  { value: 'photo',       label: 'Foto (Feed)' },
  { value: 'video',       label: 'Vídeo (Feed)' },
  { value: 'reel',        label: 'Reel' },
  { value: 'story_photo', label: 'Story — Foto' },
  { value: 'story_video', label: 'Story — Vídeo' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// ─────────────────────────────────────────────
// SUB-COMPONENTE: CARD DE CONTA
// ─────────────────────────────────────────────
function ContaCard({ conta, onRemove, onVerify, onRefresh }) {
  const [expandido, setExpandido] = useState(false);
  const [challengeCode, setChallengeCode] = useState('');
  const [enviandoCode, setEnviandoCode] = useState(false);

  const s = STATUS_LABEL[conta.login_status] || STATUS_LABEL.error;

  const handleVerify = async () => {
    if (!challengeCode.trim()) return;
    setEnviandoCode(true);
    try {
      await onVerify(conta.id, challengeCode.trim());
      setChallengeCode('');
      onRefresh();
    } catch (e) {
      alert('Erro ao verificar código: ' + (e?.response?.data?.detail || e.message));
    } finally {
      setEnviandoCode(false);
    }
  };

  return (
    <div className={`ig-conta-card ${conta.login_status === 'ok' ? 'ok' : conta.login_status === 'error' || conta.login_status === 'bad_password' ? 'error' : 'warn'}`}>
      <div className="ig-conta-header" onClick={() => setExpandido(v => !v)}>
        <div className="ig-conta-info">
          <div className="ig-conta-avatar">
            {conta.ig_username.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="ig-conta-username">@{conta.ig_username}</span>
            <span className="ig-conta-added">Adicionada em {formatDate(conta.created_at)}</span>
          </div>
        </div>
        <div className="ig-conta-badges">
          <span className="ig-badge" style={{ color: s.color, borderColor: s.color + '44', background: s.color + '18' }}>
            <s.Icon size={12} /> {s.label}
          </span>
          {conta.proxy_url && (
            <span className="ig-badge proxy">
              <Wifi size={12} /> Proxy
            </span>
          )}
          <button className="ig-icon-btn danger" onClick={(e) => { e.stopPropagation(); onRemove(conta.id, conta.ig_username); }}>
            <Trash2 size={15} />
          </button>
          {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expandido && (
        <div className="ig-conta-body">
          <div className="ig-detail-row">
            <span className="ig-detail-label">Proxy</span>
            <span className="ig-detail-value mono">{conta.proxy_url || 'Nenhum'}</span>
          </div>
          <div className="ig-detail-row">
            <span className="ig-detail-label">Último login</span>
            <span className="ig-detail-value">{formatDate(conta.last_login_at)}</span>
          </div>

          {conta.login_status === 'challenge_required' && (
            <div className="ig-challenge-box">
              <p><Shield size={14} /> O Instagram pediu verificação. Insira o código recebido por e-mail ou SMS.</p>
              <div className="ig-challenge-input-row">
                <input
                  type="text"
                  placeholder="Código de verificação"
                  value={challengeCode}
                  onChange={e => setChallengeCode(e.target.value)}
                  className="ig-input"
                  maxLength={8}
                />
                <button className="ig-btn primary" onClick={handleVerify} disabled={enviandoCode}>
                  {enviandoCode ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={14} />}
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENTE: MODAL ADICIONAR CONTA
// ─────────────────────────────────────────────
function ModalAdicionarConta({ onClose, onSuccess }) {
  const [form, setForm] = useState({ ig_username: '', ig_password: '', proxy_url: '' });
  const [mostraSenha, setMostraSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async () => {
    if (!form.ig_username.trim() || !form.ig_password.trim()) {
      setErro('Usuário e senha são obrigatórios.');
      return;
    }
    setLoading(true);
    setErro('');
    try {
      // Remove @ inicial só se for username (ex: @rafah.winx → rafah.winx)
      // Se for email (darkzmhs@gmail.com), envia intacto
      const rawUsr = form.ig_username.trim();
      const isEmail = rawUsr.includes('@') && rawUsr.indexOf('@') > 0;
      const cleanUsr = isEmail ? rawUsr : rawUsr.replace(/^@/, '');
      const payload = {
        ig_username: cleanUsr,
        ig_password: form.ig_password,
        proxy_url: form.proxy_url.trim() || null,
      };
      const res = await instagramService.vincularContaJson(payload);
      onSuccess(res);
    } catch (e) {
      setErro(e?.response?.data?.detail || 'Erro ao vincular conta. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ig-modal-overlay" onClick={onClose}>
      <div className="ig-modal" onClick={e => e.stopPropagation()}>
        <div className="ig-modal-header">
          <div className="ig-modal-title">
            <IgIcon size={20} /> Vincular Conta Instagram
          </div>
          <button className="ig-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="ig-modal-body">
          <div className="ig-field">
            <label>Usuário (@)</label>
            <input
              className="ig-input"
              placeholder="seu_usuario"
              value={form.ig_username}
              onChange={e => setForm(f => ({ ...f, ig_username: e.target.value }))}
            />
          </div>

          <div className="ig-field">
            <label>Senha</label>
            <div className="ig-input-eye">
              <input
                className="ig-input"
                type={mostraSenha ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.ig_password}
                onChange={e => setForm(f => ({ ...f, ig_password: e.target.value }))}
              />
              <button className="ig-eye-btn" onClick={() => setMostraSenha(v => !v)}>
                {mostraSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span className="ig-field-hint">A senha não é salva — apenas a sessão criptografada.</span>
          </div>

          <div className="ig-field">
            <label>Proxy <span className="ig-optional">(opcional, mas recomendado)</span></label>
            <input
              className="ig-input"
              placeholder="socks5://user:pass@host:port"
              value={form.proxy_url}
              onChange={e => setForm(f => ({ ...f, proxy_url: e.target.value }))}
            />
            <span className="ig-field-hint">Use um proxy residencial exclusivo para esta conta evitar detecção.</span>
          </div>

          {erro && <div className="ig-alert error"><AlertCircle size={14} /> {erro}</div>}
        </div>

        <div className="ig-modal-footer">
          <button className="ig-btn ghost" onClick={onClose}>Cancelar</button>
          <button className="ig-btn primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <RefreshCw size={14} className="spin" /> : <LogIn size={14} />}
            {loading ? 'Conectando...' : 'Vincular Conta'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENTE: MODAL AGENDAR POST
// ─────────────────────────────────────────────
function ModalAgendarPost({ contas, onClose, onSuccess }) {
  const [form, setForm] = useState({
    account_id: '',
    post_type: 'photo',
    caption: '',
    scheduled_for: '',
    arquivo: null,
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const fileRef = useRef();

  const handleSubmit = async () => {
    if (!form.account_id || !form.arquivo || !form.scheduled_for) {
      setErro('Conta, arquivo e data/hora são obrigatórios.');
      return;
    }
    setLoading(true);
    setErro('');
    try {
      const fd = new FormData();
      fd.append('account_id', form.account_id);
      fd.append('post_type', form.post_type);
      fd.append('caption', form.caption);
      fd.append('scheduled_for', new Date(form.scheduled_for).toISOString());
      fd.append('arquivo', form.arquivo);
      const res = await instagramService.agendarPost(fd);
      onSuccess(res);
    } catch (e) {
      setErro(e?.response?.data?.detail || 'Erro ao agendar post.');
    } finally {
      setLoading(false);
    }
  };

  const contasOk = contas.filter(c => c.login_status === 'ok');

  return (
    <div className="ig-modal-overlay" onClick={onClose}>
      <div className="ig-modal wide" onClick={e => e.stopPropagation()}>
        <div className="ig-modal-header">
          <div className="ig-modal-title">
            <Send size={20} /> Agendar Post
          </div>
          <button className="ig-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="ig-modal-body">
          {contasOk.length === 0 ? (
            <div className="ig-alert warn">
              <AlertCircle size={14} /> Nenhuma conta com status "Conectada". Vincule e conecte uma conta primeiro.
            </div>
          ) : (
            <>
              <div className="ig-field-row">
                <div className="ig-field">
                  <label>Conta</label>
                  <select className="ig-input" value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {contasOk.map(c => (
                      <option key={c.id} value={c.id}>@{c.ig_username}</option>
                    ))}
                  </select>
                </div>
                <div className="ig-field">
                  <label>Tipo de post</label>
                  <select className="ig-input" value={form.post_type} onChange={e => setForm(f => ({ ...f, post_type: e.target.value }))}>
                    {POST_TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ig-field">
                <label>Legenda <span className="ig-optional">(opcional)</span></label>
                <textarea
                  className="ig-input ig-textarea"
                  placeholder="Escreva a legenda do post..."
                  rows={3}
                  value={form.caption}
                  onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                />
              </div>

              <div className="ig-field">
                <label>Data e hora de publicação</label>
                <input
                  type="datetime-local"
                  className="ig-input"
                  value={form.scheduled_for}
                  onChange={e => setForm(f => ({ ...f, scheduled_for: e.target.value }))}
                />
              </div>

              <div className="ig-field">
                <label>Arquivo de mídia</label>
                <div
                  className={`ig-dropzone ${form.arquivo ? 'has-file' : ''}`}
                  onClick={() => fileRef.current?.click()}
                >
                  {form.arquivo ? (
                    <span className="ig-dropzone-name"><CheckCircle2 size={14} color="#22c55e" /> {form.arquivo.name}</span>
                  ) : (
                    <span>Clique para selecionar foto, vídeo ou reel</span>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={e => setForm(f => ({ ...f, arquivo: e.target.files[0] || null }))}
                  />
                </div>
              </div>
            </>
          )}

          {erro && <div className="ig-alert error"><AlertCircle size={14} /> {erro}</div>}
        </div>

        <div className="ig-modal-footer">
          <button className="ig-btn ghost" onClick={onClose}>Cancelar</button>
          {contasOk.length > 0 && (
            <button className="ig-btn primary" onClick={handleSubmit} disabled={loading}>
              {loading ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
              {loading ? 'Agendando...' : 'Agendar Post'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────
export function Instagram() {
  const [aba, setAba] = useState('contas');          // 'contas' | 'posts' | 'logs'
  const [contas, setContas] = useState([]);
  const [posts, setPosts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalConta, setModalConta] = useState(false);
  const [modalPost, setModalPost] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [toast, setToast] = useState(null);

  // Auto-refresh para posts em processamento
  useEffect(() => {
    carregarTudo();
    const interval = setInterval(() => {
      if (aba === 'posts') carregarPosts();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (aba === 'posts') carregarPosts();
    if (aba === 'logs') carregarLogs();
  }, [aba, filtroStatus]);

  const mostrarToast = (msg, tipo = 'success') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const carregarTudo = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        instagramService.listarContas(),
        instagramService.listarPosts({ limit: 30 }),
      ]);
      setContas(c);
      setPosts(p);
    } catch (e) {
      console.error('[Instagram Farm]', e);
    } finally {
      setLoading(false);
    }
  };

  const carregarPosts = async () => {
    try {
      const params = filtroStatus ? { status_filter: filtroStatus, limit: 50 } : { limit: 50 };
      setPosts(await instagramService.listarPosts(params));
    } catch (e) { console.error(e); }
  };

  const carregarLogs = async () => {
    try {
      setLogs(await instagramService.listarLogs({ limit: 100 }));
    } catch (e) { console.error(e); }
  };

  const handleRemoverConta = async (id, username) => {
    if (!confirm(`Desvincular @${username}? Todos os posts agendados desta conta serão cancelados.`)) return;
    try {
      await instagramService.desvincularConta(id);
      setContas(c => c.filter(x => x.id !== id));
      mostrarToast(`@${username} desvinculada.`);
    } catch (e) {
      mostrarToast(e?.response?.data?.detail || 'Erro ao desvincular.', 'error');
    }
  };

  const handleVerifyChallenge = async (id, code) => {
    await instagramService.verificarChallenge(id, code);
    mostrarToast('Conta verificada com sucesso!');
  };

  const handleCancelarPost = async (id) => {
    if (!confirm('Cancelar este post agendado?')) return;
    try {
      await instagramService.cancelarPost(id);
      setPosts(p => p.filter(x => x.id !== id));
      mostrarToast('Post cancelado.');
    } catch (e) {
      mostrarToast(e?.response?.data?.detail || 'Erro ao cancelar.', 'error');
    }
  };

  const handleLimparLogs = async () => {
    if (!confirm('Limpar todo o histórico de logs?')) return;
    try {
      await instagramService.limparLogs();
      setLogs([]);
      mostrarToast('Histórico limpo.');
    } catch (e) {
      mostrarToast('Erro ao limpar.', 'error');
    }
  };

  const onContaAdicionada = (res) => {
    setModalConta(false);
    carregarTudo();
    if (res.status === 'challenge_required') {
      mostrarToast('Instagram pediu verificação. Expanda a conta para confirmar o código.', 'warn');
    } else {
      mostrarToast(`@${res.ig_username} vinculada com sucesso!`);
    }
  };

  const onPostAgendado = (res) => {
    setModalPost(false);
    carregarPosts();
    mostrarToast(`Post agendado para ${formatDate(res.scheduled_for)}!`);
    setAba('posts');
  };

  // ── Estatísticas rápidas ──
  const totalContas = contas.length;
  const contasOk = contas.filter(c => c.login_status === 'ok').length;
  const postsPendentes = posts.filter(p => p.status === 'pending').length;
  const postsPublicados = posts.filter(p => p.status === 'done').length;

  return (
    <div className="ig-page">

      {/* TOAST */}
      {toast && (
        <div className={`ig-toast ${toast.tipo}`}>
          {toast.tipo === 'success' && <CheckCircle2 size={16} />}
          {toast.tipo === 'error' && <XCircle size={16} />}
          {toast.tipo === 'warn' && <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="ig-header">
        <div className="ig-header-left">
          <div className="ig-header-icon"><IgIcon size={24} /></div>
          <div>
            <h1>Instagram Farm</h1>
            <p>Gerencie múltiplas contas e agende posts com isolamento de proxy.</p>
          </div>
        </div>
        <div className="ig-header-actions">
          <button className="ig-btn secondary" onClick={carregarTudo} title="Atualizar">
            <RefreshCw size={15} />
          </button>
          <button className="ig-btn ghost" onClick={() => setModalPost(true)}>
            <Send size={15} /> Agendar Post
          </button>
          <button className="ig-btn primary" onClick={() => setModalConta(true)}>
            <Plus size={15} /> Vincular Conta
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="ig-stats-row">
        <div className="ig-stat">
          <span className="ig-stat-num">{totalContas}</span>
          <span className="ig-stat-lbl">Contas vinculadas</span>
        </div>
        <div className="ig-stat ok">
          <span className="ig-stat-num">{contasOk}</span>
          <span className="ig-stat-lbl">Conectadas</span>
        </div>
        <div className="ig-stat warn">
          <span className="ig-stat-num">{postsPendentes}</span>
          <span className="ig-stat-lbl">Posts pendentes</span>
        </div>
        <div className="ig-stat success">
          <span className="ig-stat-num">{postsPublicados}</span>
          <span className="ig-stat-lbl">Posts publicados</span>
        </div>
      </div>

      {/* ABAS */}
      <div className="ig-tabs">
        <button className={`ig-tab ${aba === 'contas' ? 'active' : ''}`} onClick={() => setAba('contas')}>
          <IgIcon size={15} /> Contas ({totalContas})
        </button>
        <button className={`ig-tab ${aba === 'posts' ? 'active' : ''}`} onClick={() => setAba('posts')}>
          <ListOrdered size={15} /> Fila de Posts ({posts.length})
        </button>
        <button className={`ig-tab ${aba === 'logs' ? 'active' : ''}`} onClick={() => setAba('logs')}>
          <History size={15} /> Histórico
        </button>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <div className="ig-loading">Carregando...</div>
      ) : (
        <>
          {/* ── ABA CONTAS ── */}
          {aba === 'contas' && (
            <div className="ig-section">
              {contas.length === 0 ? (
                <div className="ig-empty">
                  <IgIcon size={40} />
                  <p>Nenhuma conta vinculada ainda.</p>
                  <button className="ig-btn primary" onClick={() => setModalConta(true)}>
                    <Plus size={15} /> Vincular primeira conta
                  </button>
                </div>
              ) : (
                <div className="ig-contas-list">
                  {contas.map(c => (
                    <ContaCard
                      key={c.id}
                      conta={c}
                      onRemove={handleRemoverConta}
                      onVerify={handleVerifyChallenge}
                      onRefresh={carregarTudo}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ABA POSTS ── */}
          {aba === 'posts' && (
            <div className="ig-section">
              <div className="ig-toolbar">
                <select className="ig-input small" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                  <option value="">Todos os status</option>
                  <option value="pending">Pendentes</option>
                  <option value="processing">Publicando</option>
                  <option value="done">Publicados</option>
                  <option value="error">Com erro</option>
                </select>
                <button className="ig-btn ghost small" onClick={carregarPosts}>
                  <RefreshCw size={13} /> Atualizar
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="ig-empty">
                  <Send size={36} />
                  <p>Nenhum post encontrado.</p>
                  <button className="ig-btn primary" onClick={() => setModalPost(true)}>
                    <Plus size={15} /> Agendar post
                  </button>
                </div>
              ) : (
                <div className="ig-posts-table-wrap">
                  <table className="ig-table">
                    <thead>
                      <tr>
                        <th>Conta</th>
                        <th>Tipo</th>
                        <th>Legenda</th>
                        <th>Agendado para</th>
                        <th>Status</th>
                        <th>Publicado em</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map(p => {
                        const ps = POST_STATUS_LABEL[p.status] || POST_STATUS_LABEL.error;
                        return (
                          <tr key={p.id}>
                            <td className="mono">@{p.ig_username}</td>
                            <td>{POST_TYPE_OPTIONS.find(o => o.value === p.post_type)?.label || p.post_type}</td>
                            <td className="ig-caption-cell">{p.caption ? p.caption.slice(0, 50) + (p.caption.length > 50 ? '…' : '') : <span className="muted">—</span>}</td>
                            <td>{formatDate(p.scheduled_for)}</td>
                            <td>
                              <span className="ig-badge" style={{ color: ps.color, borderColor: ps.color + '44', background: ps.color + '18' }}>
                                <ps.Icon size={11} /> {ps.label}
                              </span>
                            </td>
                            <td>{formatDate(p.sent_at)}</td>
                            <td>
                              {(p.status === 'pending' || p.status === 'error') && (
                                <button className="ig-icon-btn danger" onClick={() => handleCancelarPost(p.id)} title="Cancelar">
                                  <Trash2 size={14} />
                                </button>
                              )}
                              {p.status === 'error' && p.error_msg && (
                                <span className="ig-error-tip" title={p.error_msg}><AlertCircle size={14} color="#ef4444" /></span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── ABA LOGS ── */}
          {aba === 'logs' && (
            <div className="ig-section">
              <div className="ig-toolbar">
                <span className="ig-toolbar-info">{logs.length} registros</span>
                <button className="ig-btn ghost small danger" onClick={handleLimparLogs}>
                  <Trash2 size={13} /> Limpar histórico
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="ig-empty">
                  <History size={36} />
                  <p>Nenhum registro no histórico ainda.</p>
                </div>
              ) : (
                <div className="ig-logs-list">
                  {logs.map(l => (
                    <div key={l.id} className="ig-log-row">
                      <span className="ig-log-time">{formatDate(l.created_at)}</span>
                      <span className={`ig-log-action ${l.action.includes('error') ? 'error' : l.action.includes('done') || l.action.includes('added') ? 'success' : ''}`}>
                        {l.action}
                      </span>
                      {l.details && Object.keys(l.details).length > 0 && (
                        <span className="ig-log-details mono">
                          {JSON.stringify(l.details).slice(0, 120)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAIS */}
      {modalConta && <ModalAdicionarConta onClose={() => setModalConta(false)} onSuccess={onContaAdicionada} />}
      {modalPost  && <ModalAgendarPost contas={contas} onClose={() => setModalPost(false)} onSuccess={onPostAgendado} />}
    </div>
  );
}