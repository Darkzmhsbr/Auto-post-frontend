import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Wrench, Shield, RefreshCw, Layers, Scissors, Droplets,
  Eye, Zap, Lock, Upload, X, Download, CheckCircle,
  AlertTriangle, Loader2, Clock, History, FileVideo,
  FileImage, ArrowRight, Info
} from 'lucide-react';
import { ferramentasService } from '../services/api';
import './Ferramentas.css';

// ==========================================
// CATÁLOGO DE FERRAMENTAS
// ==========================================
const FERRAMENTAS = [
  {
    id: 'limpar_metadados',
    nome: 'Limpar Metadados',
    descricao: 'Remove todos os dados sensíveis de imagens, vídeos e áudios: EXIF, GPS, autor, câmera e timestamps.',
    categoria: 'protecao',
    catLabel: 'Proteção',
    icone: Shield,
    aceitaMidia: 'imagem e vídeo/áudio',
    extensoes: '.jpg .png .mp4 .mov .mp3 .wav .webp',
    params: [],
  },
  {
    id: 'conversor_proporcao',
    nome: 'Conversor Stories/Feed',
    descricao: 'Converte entre as proporções 9:16 (Stories/Reels) e 3:4 (Feed), recortando de forma centralizada.',
    categoria: 'conversao',
    catLabel: 'Conversão',
    icone: RefreshCw,
    aceitaMidia: 'imagem e vídeo',
    extensoes: '.jpg .png .webp .mp4 .mov',
    params: [
      {
        key: 'proporcao',
        label: 'Proporção de saída',
        tipo: 'select',
        opcoes: [
          { value: '9:16', label: '9:16 — Stories / Reels' },
          { value: '3:4',  label: '3:4 — Feed' },
        ],
        default: '9:16',
      },
    ],
  },
  {
    id: 'cloaker_criativo',
    nome: 'Cloaker de Criativo',
    descricao: 'Gera um hash 100% único para imagens sem alterar a qualidade visual. Ideal para evitar rejeição por similaridade em anúncios.',
    categoria: 'cloaking',
    catLabel: 'Cloaking',
    icone: Layers,
    aceitaMidia: 'apenas imagem',
    extensoes: '.jpg .jpeg .png .webp',
    params: [],
  },
  {
    id: 'processamento_completo',
    nome: 'Processamento Completo',
    descricao: 'All-in-One: limpa metadados + reencode + hash único em uma única operação. O máximo de proteção para seus criativos em vídeo.',
    categoria: 'allinone',
    catLabel: 'All-in-One',
    icone: Zap,
    aceitaMidia: 'apenas vídeo',
    extensoes: '.mp4 .mov .avi .mkv',
    params: [],
  },
  {
    id: 'cloaker_video',
    nome: 'Cloaker de Vídeos',
    descricao: 'Reencode inteligente com CRF variável e limpeza de metadados, gerando um hash completamente diferente sem degradação perceptível.',
    categoria: 'cloaking',
    catLabel: 'Cloaking',
    icone: Eye,
    aceitaMidia: 'apenas vídeo',
    extensoes: '.mp4 .mov .avi .mkv .webm',
    params: [],
  },
  {
    id: 'cortar_video',
    nome: 'Cortador de Vídeo',
    descricao: 'Corta o vídeo em qualquer ponto de início e fim sem reencoder (cópia direta de streams) — rápido e sem perda de qualidade.',
    categoria: 'edicao',
    catLabel: 'Edição',
    icone: Scissors,
    aceitaMidia: 'apenas vídeo',
    extensoes: '.mp4 .mov .avi .mkv',
    params: [
      { key: 'inicio', label: 'Início (HH:MM:SS)', tipo: 'text', placeholder: '00:00:00', default: '00:00:00' },
      { key: 'fim',    label: 'Fim (HH:MM:SS)',    tipo: 'text', placeholder: '00:01:30', default: '' },
    ],
  },
  {
    id: 'marca_dagua',
    nome: 'Marca D\'água',
    descricao: 'Adiciona watermark de texto ou imagem PNG em fotos e vídeos, com controle de posição, tamanho e opacidade.',
    categoria: 'edicao',
    catLabel: 'Edição',
    icone: Droplets,
    aceitaMidia: 'imagem e vídeo',
    extensoes: '.jpg .png .webp .mp4 .mov',
    params: [
      {
        key: 'modo',
        label: 'Tipo de marca d\'água',
        tipo: 'select',
        opcoes: [
          { value: 'texto',  label: '✏️ Texto personalizado' },
          { value: 'imagem', label: '🖼️ Imagem PNG (logo)' },
        ],
        default: 'texto',
      },
      { key: 'texto', label: 'Texto (se modo=texto)', tipo: 'text', placeholder: '© Seu Nome', default: '© Criativo' },
      { key: 'tamanho_fonte', label: 'Tamanho do texto (% da altura, ex: 8)', tipo: 'number', placeholder: '8', default: '8' },
      {
        key: 'posicao',
        label: 'Posição',
        tipo: 'select',
        opcoes: [
          { value: 'bottom_right', label: 'Inferior direito' },
          { value: 'bottom_left',  label: 'Inferior esquerdo' },
          { value: 'top_right',    label: 'Superior direito' },
          { value: 'top_left',     label: 'Superior esquerdo' },
          { value: 'center',       label: 'Centro' },
        ],
        default: 'bottom_right',
      },
      { key: 'opacidade', label: 'Opacidade (0–100)', tipo: 'number', placeholder: '70', default: '70' },
      { key: 'escala_wm', label: 'Tamanho da logo (% da largura)', tipo: 'number', placeholder: '20', default: '20' },
    ],
  },
  {
    id: 'gerador_preview',
    nome: 'Gerador de Preview',
    descricao: 'Cria uma versão censurada do criativo com blur central para usar como thumbnail ou preview antes da compra.',
    categoria: 'protecao',
    catLabel: 'Proteção',
    icone: Eye,
    aceitaMidia: 'imagem e vídeo',
    extensoes: '.jpg .png .webp .mp4 .mov',
    params: [],
  },
];

// Mapa de nomes amigáveis para o histórico
const NOME_FERRAMENTA = Object.fromEntries(FERRAMENTAS.map(f => [f.id, f.nome]));

// URL base da API
const API_BASE = import.meta.env.VITE_API_URL || 'https://api-autopost.zenyxvips.com';

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export function Ferramentas() {
  const [acesso, setAcesso]       = useState(null);  // null=carregando, true=ok, false=bloqueado
  const [ferrAtiva, setFerrAtiva] = useState(null);  // ferramenta com modal aberto
  const [jobs, setJobs]           = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    verificarAcesso();
    carregarJobs();
  }, []);

  const verificarAcesso = async () => {
    try {
      // Faz uma chamada teste de status — se retornar 403, está bloqueado
      await ferramentasService.verificarAcesso();
      setAcesso(true);
    } catch (e) {
      if (e?.response?.status === 403) setAcesso(false);
      else setAcesso(true); // Erro de rede não bloqueia a UI
    }
  };

  const carregarJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await ferramentasService.listarJobs();
      setJobs(data || []);
    } catch (e) {
      console.error('Erro ao carregar jobs:', e);
    } finally {
      setLoadingJobs(false);
    }
  };

  const abrirFerramenta = (ferr) => {
    if (acesso === false) return;
    setFerrAtiva(ferr);
  };

  const fecharModal = () => {
    setFerrAtiva(null);
    carregarJobs(); // Atualiza o histórico ao fechar
  };

  if (acesso === null) {
    return (
      <div className="ferr-loading">
        <Loader2 size={28} className="ferr-spin" />
        <p>Verificando acesso às ferramentas...</p>
      </div>
    );
  }

  return (
    <div className="ferr-container">

      {/* HEADER */}
      <div className="ferr-header">
        <div className="ferr-header-text">
          <h1><Wrench size={28} /> Ferramentas de Criativos</h1>
          <p>Processe, proteja e otimize seus criativos para anúncios sem rejeições.</p>
        </div>
        {acesso === false && (
          <div className="ferr-locked-badge">
            <Lock size={16} /> Acesso bloqueado
          </div>
        )}
      </div>

      {/* BANNER DE BLOQUEIO */}
      {acesso === false && (
        <div className="ferr-blocked-banner">
          <Lock size={22} color="#ef4444" />
          <div>
            <h3>Recurso bloqueado</h3>
            <p>
              As Ferramentas de Criativos são liberadas automaticamente quando você desbloqueia o recurso
              {' '}<strong>Clonador de Prévias/VIPs</strong> na plataforma{' '}
              <a href="https://www.zenyxvips.com/dashboard" target="_blank" rel="noreferrer">Zenyx VIPs</a>.
              Basta atingir a meta de faturamento configurada.
            </p>
          </div>
        </div>
      )}

      {/* GRID DE FERRAMENTAS */}
      <div className="ferr-grid">
        {FERRAMENTAS.map(ferr => (
          <FerramentaCard
            key={ferr.id}
            ferramenta={ferr}
            bloqueado={acesso === false}
            onClick={() => abrirFerramenta(ferr)}
          />
        ))}
      </div>

      {/* HISTÓRICO DE JOBS */}
      <div className="ferr-historico-section">
        <h2><History size={18} /> Histórico de Processamentos</h2>
        {loadingJobs ? (
          <div className="ferr-loading" style={{ padding: '20px 0' }}>
            <Loader2 size={20} className="ferr-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <p style={{ color: '#555', fontSize: '0.88rem' }}>
            Nenhum processamento ainda. Use uma ferramenta acima para começar.
          </p>
        ) : (
          <div className="ferr-historico-lista">
            {jobs.map(job => (
              <div className="ferr-historico-item" key={job.job_id}>
                <div className="ferr-hist-info">
                  <FileVideo size={16} color="#555" />
                  <div>
                    <div className="ferr-hist-nome">{NOME_FERRAMENTA[job.tipo] || job.tipo}</div>
                    <div className="ferr-hist-data">
                      {job.created_at ? new Date(job.created_at).toLocaleString('pt-BR') : '—'}
                    </div>
                  </div>
                </div>
                <span className={`ferr-hist-status ${job.status}`}>
                  {job.status === 'done' && <CheckCircle size={11} />}
                  {(job.status === 'pending' || job.status === 'processing') && <Loader2 size={11} />}
                  {job.status === 'error' && <AlertTriangle size={11} />}
                  {job.status}
                </span>
                {job.status === 'done' && job.download_url && (
                  <a
                    className="ferr-hist-download"
                    href={`${API_BASE}${job.download_url}?token=${localStorage.getItem('zenyx_token') || ''}`}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={13} /> Baixar
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE PROCESSAMENTO */}
      {ferrAtiva && (
        <FerramentaModal
          ferramenta={ferrAtiva}
          onClose={fecharModal}
        />
      )}
    </div>
  );
}

// ==========================================
// CARD DE FERRAMENTA
// ==========================================
function FerramentaCard({ ferramenta, bloqueado, onClick }) {
  const Icone = ferramenta.icone;
  return (
    <div
      className={`ferr-card cat-${ferramenta.categoria} ${bloqueado ? 'disabled' : ''}`}
      onClick={onClick}
    >
      <div className="ferr-card-header">
        <div className="ferr-card-icon">
          <Icone size={22} />
        </div>
        <span className="ferr-cat-badge">{ferramenta.catLabel}</span>
      </div>

      <h3 className="ferr-card-title">{ferramenta.nome}</h3>
      <p className="ferr-card-desc">{ferramenta.descricao}</p>

      <div className="ferr-card-meta">
        <FileImage size={13} />
        <span>{ferramenta.aceitaMidia}</span>
      </div>

      <button className="ferr-card-btn" disabled={bloqueado}>
        <ArrowRight size={15} />
        {bloqueado ? 'Bloqueado' : 'Usar ferramenta'}
      </button>
    </div>
  );
}

// ==========================================
// MODAL DE PROCESSAMENTO
// ==========================================
function FerramentaModal({ ferramenta, onClose }) {
  const Icone = ferramenta.icone;

  // Estado do modal
  const [arquivo, setArquivo]       = useState(null);
  const [wmFile, setWmFile]         = useState(null);   // arquivo PNG da marca d'água
  const [wmPreview, setWmPreview]   = useState(null);   // preview base64 da logo
  const [params, setParams]         = useState(
    Object.fromEntries(ferramenta.params.map(p => [p.key, p.default ?? '']))
  );
  const [enviando, setEnviando]     = useState(false);
  const [jobId, setJobId]           = useState(null);
  const [jobStatus, setJobStatus]   = useState(null); // 'pending'|'processing'|'done'|'error'
  const [jobDownload, setJobDownload] = useState(null);
  const [erroMsg, setErroMsg]       = useState('');
  const [dragover, setDragover]     = useState(false);

  const pollingRef = useRef(null);

  // Polling de status do job
  const iniciarPolling = useCallback((id) => {
    pollingRef.current = setInterval(async () => {
      try {
        const data = await ferramentasService.statusJob(id);
        setJobStatus(data.status);
        if (data.status === 'done') {
          setJobDownload(data.download_url);
          clearInterval(pollingRef.current);
        } else if (data.status === 'error') {
          setErroMsg(data.error_msg || 'Erro desconhecido no processamento.');
          clearInterval(pollingRef.current);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const handleArquivo = (file) => {
    if (!file) return;
    setArquivo(file);
    setWmFile(null);
    setWmPreview(null);
    setJobId(null);
    setJobStatus(null);
    setJobDownload(null);
    setErroMsg('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) handleArquivo(file);
  };

  const handleProcessar = async () => {
    if (!arquivo) return;
    setEnviando(true);
    setErroMsg('');
    try {
      // Monta FormData
      const formData = new FormData();
      formData.append('tipo', ferramenta.id);

      // Para marca_dagua com modo=imagem, converte o PNG para base64 e inclui nos params
      let paramsToSend = { ...params };
      if (ferramenta.id === 'marca_dagua' && params.modo === 'imagem' && wmFile) {
        const reader = new FileReader();
        const wmB64 = await new Promise((res) => {
          reader.onload = (e) => res(e.target.result.split(',')[1]);
          reader.readAsDataURL(wmFile);
        });
        paramsToSend.wm_base64 = wmB64;
      }

      formData.append('parametros', JSON.stringify(paramsToSend));
      formData.append('arquivo', arquivo);

      const data = await ferramentasService.processar(formData);
      setJobId(data.job_id);
      setJobStatus(data.status);

      // Se já veio como 'processing' ou 'pending', inicia polling
      if (data.status !== 'done') {
        iniciarPolling(data.job_id);
      } else {
        // Imagens rápidas podem já chegar como processing → faz polling mesmo assim
        iniciarPolling(data.job_id);
      }
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Erro ao enviar arquivo.';
      setErroMsg(msg);
    } finally {
      setEnviando(false);
    }
  };

  const handleNovoArquivo = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setArquivo(null);
    setJobId(null);
    setJobStatus(null);
    setJobDownload(null);
    setErroMsg('');
  };

  const downloadUrl = jobDownload
    ? `${API_BASE}${jobDownload}?token=${localStorage.getItem('zenyx_token') || ''}`
    : null;
  const processando = jobStatus === 'pending' || jobStatus === 'processing';
  const concluido   = jobStatus === 'done';
  const comErro     = jobStatus === 'error';

  return (
    <div className="ferr-modal-overlay" onClick={onClose}>
      <div className="ferr-modal" onClick={e => e.stopPropagation()}>

        {/* HEADER DO MODAL */}
        <div className="ferr-modal-header">
          <div className="ferr-modal-header-left">
            <div className={`ferr-modal-icon cat-${ferramenta.categoria}`}
                 style={{ background: 'rgba(195,51,255,0.12)', color: '#c333ff' }}>
              <Icone size={20} />
            </div>
            <div>
              <p className="ferr-modal-title">{ferramenta.nome}</p>
              <p className="ferr-modal-subtitle">{ferramenta.extensoes}</p>
            </div>
          </div>
          <button className="ferr-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* BODY DO MODAL */}
        <div className="ferr-modal-body">

          {/* UPLOAD */}
          {!jobId && (
            <>
              <div
                className={`ferr-upload-zone ${dragover ? 'dragover' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragover(true); }}
                onDragLeave={() => setDragover(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept={ferramenta.extensoes.split(' ').join(',')}
                  onChange={e => handleArquivo(e.target.files[0])}
                />
                {arquivo ? (
                  <div className="ferr-upload-filename">
                    <FileVideo size={16} />
                    {arquivo.name}
                    <span style={{ color: '#555', fontSize: '0.75rem' }}>
                      ({(arquivo.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload size={28} color="#444" />
                    <p><strong>Clique para selecionar</strong> ou arraste o arquivo aqui</p>
                    <p style={{ fontSize: '0.78rem' }}>Aceita: {ferramenta.extensoes}</p>
                  </>
                )}
              </div>

              {/* PARÂMETROS */}
              {ferramenta.params.length > 0 && arquivo && (
                <div className="ferr-params">
                  {ferramenta.params.map(p => (
                    <ParamField key={p.key} param={p} value={params[p.key]} onChange={v => setParams(prev => ({ ...prev, [p.key]: v }))} />
                  ))}
                  {/* Upload PNG da logo quando marca_dagua modo=imagem */}
                  {ferramenta.id === 'marca_dagua' && params.modo === 'imagem' && (
                    <div className="ferr-param-group">
                      <label className="ferr-param-label">Arquivo PNG da logo</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="file"
                          accept=".png"
                          style={{ flex: 1, color: '#ccc', fontSize: '0.85rem' }}
                          onChange={e => {
                            const f = e.target.files[0];
                            if (!f) return;
                            setWmFile(f);
                            const r = new FileReader();
                            r.onload = ev => setWmPreview(ev.target.result);
                            r.readAsDataURL(f);
                          }}
                        />
                        {wmPreview && (
                          <img src={wmPreview} alt="preview logo" style={{ height: 40, borderRadius: 6, border: '1px solid #333' }} />
                        )}
                      </div>
                      {!wmFile && <p style={{ fontSize: '0.72rem', color: '#555', margin: '4px 0 0' }}>Selecione um arquivo PNG transparente com sua logo</p>}
                    </div>
                  )}
                </div>
              )}

              {/* ERRO */}
              {erroMsg && (
                <div className="ferr-status-error">
                  <strong><AlertTriangle size={14} /> Erro</strong>
                  {erroMsg}
                </div>
              )}

              {/* AÇÕES */}
              <div className="ferr-modal-actions">
                <button className="ferr-btn-secondary" onClick={onClose}>
                  <X size={15} /> Cancelar
                </button>
                <button
                  className="ferr-btn-primary"
                  disabled={!arquivo || enviando}
                  onClick={handleProcessar}
                >
                  {enviando
                    ? <><Loader2 size={16} className="ferr-spin" /> Enviando...</>
                    : <><Zap size={16} /> Processar</>
                  }
                </button>
              </div>
            </>
          )}

          {/* PROGRESSO (job criado, aguardando) */}
          {jobId && processando && (
            <div className="ferr-progress-area">
              <Loader2 size={32} className="ferr-spin" color="#c333ff" />
              <strong>Processando...</strong>
              <p>
                {jobStatus === 'pending'
                  ? 'Aguardando na fila — será processado em breve.'
                  : 'Processamento em andamento. Não feche esta janela.'}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#444' }}>
                Verificando a cada 3 segundos...
              </p>
            </div>
          )}

          {/* CONCLUÍDO */}
          {jobId && concluido && (
            <>
              <div className="ferr-status-done">
                <CheckCircle size={36} color="#22c55e" />
                <h3>Processamento concluído!</h3>
                <p>Seu arquivo está pronto. Clique em baixar para salvar.</p>
              </div>
              <div className="ferr-modal-actions">
                <button className="ferr-btn-secondary" onClick={handleNovoArquivo}>
                  <RefreshCw size={15} /> Novo arquivo
                </button>
                <a className="ferr-btn-download" href={downloadUrl} download target="_blank" rel="noreferrer">
                  <Download size={16} /> Baixar resultado
                </a>
              </div>
            </>
          )}

          {/* ERRO NO PROCESSAMENTO */}
          {jobId && comErro && (
            <>
              <div className="ferr-status-error">
                <strong><AlertTriangle size={14} /> Falha no processamento</strong>
                {erroMsg || 'O servidor encontrou um erro ao processar seu arquivo.'}
              </div>
              <div className="ferr-modal-actions">
                <button className="ferr-btn-secondary" onClick={onClose}>
                  <X size={15} /> Fechar
                </button>
                <button className="ferr-btn-primary" onClick={handleNovoArquivo}>
                  <RefreshCw size={15} /> Tentar novamente
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ==========================================
// CAMPO DE PARÂMETRO
// ==========================================
function ParamField({ param, value, onChange }) {
  return (
    <div className="ferr-param-group">
      <label className="ferr-param-label">{param.label}</label>
      {param.tipo === 'select' ? (
        <select
          className="ferr-param-select"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          {param.opcoes.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      ) : (
        <input
          className="ferr-param-input"
          type={param.tipo || 'text'}
          placeholder={param.placeholder || ''}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  );
}