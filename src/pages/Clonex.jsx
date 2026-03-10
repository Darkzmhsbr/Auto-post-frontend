import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Unlock, ArrowRight, Zap, Shield, Server, AlertTriangle, Copy as CopyIcon, Eye, Sparkles } from 'lucide-react';
import { clonexService } from '../services/api';
import './Clonex.css';

export function Clonex() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await clonexService.getStatus();
      setStatus(data);
    } catch (error) {
      console.error('Erro ao carregar status do Clonex:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPrevias = () => {
    navigate('/canais');
  };

  if (loading) {
    return (
      <div className="clonex-loading">
        <Loader2 size={24} className="spin" />
        <p>Carregando módulos Clonex...</p>
      </div>
    );
  }

  return (
    <div className="clonex-container">
      {/* HEADER */}
      <div className="clonex-header">
        <div className="clonex-header-text">
          <h1><CopyIcon size={28} /> Clonex</h1>
          <p>Sistema inteligente de clonagem de canais e grupos do Telegram.</p>
        </div>
      </div>

      {/* CARDS DOS MÓDULOS */}
      <div className="clonex-modules-grid">

        {/* ========== CLONEX PRÉVIAS (LIBERADO) ========== */}
        <div className="clonex-module-card unlocked">
          <div className="clonex-module-header">
            <div className="clonex-module-icon unlocked">
              <Eye size={28} />
            </div>
            <div className="clonex-module-status unlocked">
              <Unlock size={13} /> Liberado
            </div>
          </div>

          <h2 className="clonex-module-title">Clonex Prévias</h2>
          <p className="clonex-module-desc">
            Clone canais e grupos de prévias — seus próprios ou de concorrentes. 
            Ideal para replicar conteúdo de demonstração e atrair novos clientes.
          </p>

          <div className="clonex-module-features">
            <div className="clonex-feature-item">
              <Zap size={14} /> Clone canais de prévias (seus ou concorrentes)
            </div>
            <div className="clonex-feature-item">
              <Zap size={14} /> Substituição inteligente de CTA/links
            </div>
            <div className="clonex-feature-item">
              <Zap size={14} /> Legenda personalizada com formatação HTML
            </div>
            <div className="clonex-feature-item">
              <Zap size={14} /> Múltiplos destinos simultâneos
            </div>
            <div className="clonex-feature-item warning">
              <AlertTriangle size={14} /> Limite: mídias de até <strong>50MB</strong>
            </div>
          </div>

          <button className="clonex-action-btn unlocked" onClick={handleOpenPrevias}>
            <ArrowRight size={18} /> Acessar Clonex Prévias
          </button>
        </div>

        {/* ========== CLONEX VIPs (BLOQUEADO / ADMIN) ========== */}
        <div className={`clonex-module-card ${status?.clonex_vips?.unlocked ? 'unlocked' : 'locked'}`}>
          <div className="clonex-module-header">
            <div className={`clonex-module-icon ${status?.clonex_vips?.unlocked ? 'unlocked' : 'locked'}`}>
              <Sparkles size={28} />
            </div>
            <div className={`clonex-module-status ${status?.clonex_vips?.unlocked ? 'unlocked' : 'locked'}`}>
              {status?.clonex_vips?.unlocked ? (
                <><Shield size={13} /> Admin — Liberado</>
              ) : (
                <><Lock size={13} /> Bloqueado</>
              )}
            </div>
          </div>

          <h2 className="clonex-module-title">Clonex VIPs</h2>
          <p className="clonex-module-desc">
            Clone canais VIP completos sem limite de tamanho de mídia. 
            Perfeito para replicar canais premium com vídeos longos e arquivos pesados.
          </p>

          <div className="clonex-module-features">
            <div className="clonex-feature-item">
              <Zap size={14} /> Tudo do Clonex Prévias incluído
            </div>
            <div className="clonex-feature-item">
              <Zap size={14} /> Sem limite de tamanho de mídia
            </div>
            <div className="clonex-feature-item">
              <Zap size={14} /> Clone completo de canais VIP
            </div>
            <div className="clonex-feature-item">
              <Zap size={14} /> Vídeos longos e arquivos pesados
            </div>
          </div>

          {status?.clonex_vips?.unlocked ? (
            <button className="clonex-action-btn unlocked" onClick={handleOpenPrevias}>
              <ArrowRight size={18} /> Acessar Clonex VIPs
            </button>
          ) : (
            <div className="clonex-blocked-info">
              <div className="clonex-blocked-icon">
                <Lock size={20} />
              </div>
              <p className="clonex-blocked-text">
                Este recurso será liberado após a migração do backend para uma VPS dedicada.
              </p>
              <div className="clonex-blocked-detail">
                <Server size={14} />
                <span>
                  O Railway cobra por GB excedente. A solução definitiva é migrar o backend do AutoPost 
                  para uma VPS como <strong>Contabo</strong> ou <strong>Hetzner</strong> (~R$35/mês), 
                  que oferece <strong>32TB de tráfego mensal</strong> por um valor fixo.
                </span>
              </div>
              <div className="clonex-blocked-note">
                <AlertTriangle size={13} />
                <span>O Zenyx VIPs principal continuará no Railway. Apenas o backend do AutoPost será migrado.</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}