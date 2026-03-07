import React, { useState, useEffect, useCallback, useRef } from 'react';
import { premiumEmojiService } from '../services/api';
import './PremiumEmojiPicker.css';

/**
 * ✨ PremiumEmojiPicker - Componente reutilizável para inserir emojis premium do Telegram.
 * 
 * COMO USAR EM QUALQUER PÁGINA:
 * 
 *   import { PremiumEmojiPicker } from '../components/PremiumEmojiPicker';
 * 
 *   // Dentro do JSX, ao lado do textarea/input:
 *   <PremiumEmojiPicker onSelect={(shortcode) => {
 *     setText(prev => prev + shortcode);
 *   }} />
 * 
 * COMO INTEGRAR NO RichInput (para ativar em TODAS as páginas de uma vez):
 *   Basta importar este componente dentro do RichInput.jsx e renderizá-lo
 *   ao lado da toolbar de formatação existente, passando o onSelect para
 *   inserir o shortcode na posição do cursor.
 * 
 * Props:
 *   - onSelect(shortcode: string): Callback chamado quando o usuário clica num emoji.
 *     Recebe o shortcode (ex: ":fire_premium:") para ser inserido no texto.
 *   - disabled (boolean): Se true, o botão fica desabilitado.
 *   - position ("top" | "bottom"): Posição do painel. Default: "top" (abre acima).
 *   - compact (boolean): Se true, mostra apenas o ícone sem texto.
 */
export function PremiumEmojiPicker({ onSelect, disabled = false, position = 'top', compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const panelRef = useRef(null);
  const searchTimeout = useRef(null);

  // Carrega catálogo ao abrir pela primeira vez
  const loadCatalog = useCallback(async () => {
    if (catalog) return; // Já carregado
    setLoading(true);
    try {
      const data = await premiumEmojiService.getCatalog();
      setCatalog(data);
    } catch (error) {
      console.error('Erro ao carregar catálogo de emojis premium:', error);
    } finally {
      setLoading(false);
    }
  }, [catalog]);

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      loadCatalog();
      setSearchTerm('');
      setSearchResults(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setSearchResults(null);
  };

  const handleEmojiClick = (emoji) => {
    if (onSelect) {
      onSelect(emoji.shortcode);
    }
    // Não fecha o picker para permitir inserção múltipla
  };

  // Busca com debounce
  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (!value || value.length < 2) {
      setSearchResults(null);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await premiumEmojiService.search(value);
        setSearchResults(data.emojis || []);
      } catch (error) {
        console.error('Erro na busca:', error);
      }
    }, 300);
  };

  // Filtra emojis pelo tab ativo
  const getVisibleEmojis = () => {
    if (searchResults !== null) {
      return [{ id: 0, name: 'Resultados', icon: '🔍', emojis: searchResults }];
    }
    if (!catalog || !catalog.packs) return [];
    
    if (activeTab === 'all') {
      return catalog.packs;
    }
    
    return catalog.packs.filter(p => p.id === activeTab);
  };

  const totalEmojis = catalog?.total_emojis || 0;
  const visiblePacks = getVisibleEmojis();

  // Posicionamento do painel
  const panelStyle = position === 'bottom' 
    ? { top: 'calc(100% + 8px)', bottom: 'auto' }
    : {};

  return (
    <div className="pep-trigger-wrapper">
      {/* Botão trigger */}
      <button
        type="button"
        className={`pep-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        title="Inserir Emoji Premium ✨"
      >
        <span className="pep-icon">✨</span>
        {!compact && <span>Emoji Premium</span>}
        {!compact && totalEmojis > 0 && (
          <span className="pep-badge">PRO</span>
        )}
      </button>

      {/* Overlay para fechar ao clicar fora */}
      {isOpen && <div className="pep-overlay" onClick={handleClose} />}

      {/* Painel do Picker */}
      {isOpen && (
        <div className="pep-panel" ref={panelRef} style={panelStyle}>
          {/* Header */}
          <div className="pep-header">
            <h4>✨ Emojis Premium</h4>
            <button className="pep-close-btn" onClick={handleClose}>✕</button>
          </div>

          {/* Busca */}
          <div className="pep-search">
            <input
              type="text"
              placeholder="Buscar emoji..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Tabs de Categorias */}
          {!searchResults && catalog && catalog.packs && catalog.packs.length > 1 && (
            <div className="pep-tabs">
              <button
                className={`pep-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <span className="tab-icon">📋</span> Todos
              </button>
              {catalog.packs.map(pack => (
                <button
                  key={pack.id}
                  className={`pep-tab ${activeTab === pack.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(pack.id)}
                >
                  <span className="tab-icon">{pack.icon}</span>
                  {pack.name}
                </button>
              ))}
            </div>
          )}

          {/* Grade de Emojis */}
          <div className="pep-grid-container">
            {loading ? (
              <div className="pep-loading">
                <div className="pep-spinner" />
                <span>Carregando emojis...</span>
              </div>
            ) : visiblePacks.length === 0 ? (
              <div className="pep-empty">
                <div className="pep-empty-icon">✨</div>
                {searchTerm 
                  ? 'Nenhum emoji encontrado para essa busca.'
                  : 'Nenhum emoji premium disponível ainda.'
                }
              </div>
            ) : (
              visiblePacks.map(pack => (
                <React.Fragment key={pack.id}>
                  {activeTab === 'all' && (
                    <div className="pep-pack-label">
                      {pack.icon} {pack.name}
                    </div>
                  )}
                  <div className="pep-grid">
                    {pack.emojis.map((emoji, idx) => {
                      // ✨ Detecta se existem emojis duplicados (mesmo fallback) no pack
                      const duplicates = pack.emojis.filter(e => e.fallback === emoji.fallback);
                      const hasDuplicate = duplicates.length > 1;
                      const dupIndex = hasDuplicate ? duplicates.indexOf(emoji) + 1 : 0;
                      
                      return (
                        <button
                          key={emoji.id}
                          className="pep-emoji-item"
                          onClick={() => handleEmojiClick(emoji)}
                          title={`${emoji.name} (${emoji.shortcode})`}
                        >
                          {emoji.fallback}
                          {hasDuplicate && (
                            <span className="pep-dup-badge">{dupIndex}</span>
                          )}
                          {emoji.emoji_type === 'animated' && (
                            <span className="pep-animated-dot" />
                          )}
                          <span className="pep-tooltip">
                            {emoji.name}<br/>{emoji.shortcode}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </React.Fragment>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pep-footer">
            <span className="pep-footer-text">
              Emojis Premium do Telegram
            </span>
            <span className="pep-footer-count">
              {totalEmojis} emoji{totalEmojis !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PremiumEmojiPicker;