import React, { useState, useEffect } from 'react';
import { telegramService } from '../services/api';
import { 
  Smartphone, Key, ShieldCheck, AlertTriangle, 
  ArrowRight, LogOut, Loader2, Info
} from 'lucide-react';
import './SessaoTelegram.css';

export function SessaoTelegram() {
  const [status, setStatus] = useState('loading'); // loading, conectada, desconectada
  const [step, setStep] = useState(1); // 1: Pedir código, 2: Digitar código
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Dados do formulário
  const [phone, setPhone] = useState('');
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false); // Para 2FA

  useEffect(() => {
    verificarStatus();
  }, []);

  const verificarStatus = async () => {
    try {
      const res = await telegramService.getStatus();
      if (res.status === 'ativa') {
        setStatus('conectada');
        setPhone(res.phone || '');
      } else {
        setStatus('desconectada');
      }
    } catch (error) {
      console.error(error);
      setStatus('desconectada');
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!phone || !apiId || !apiHash) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }
    setErrorMsg('');
    setLoadingAction(true);
    
    try {
      await telegramService.requestCode({ phone, api_id: apiId, api_hash: apiHash });
      setStep(2); // Avança para a tela de digitar o código
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'Erro ao pedir código. Verifique os dados.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) {
      setErrorMsg('Digite o código recebido no Telegram.');
      return;
    }
    setErrorMsg('');
    setLoadingAction(true);
    
    try {
      const res = await telegramService.verifyCode({ code, password: password || null });
      if (res.needs_password) {
        setNeedsPassword(true);
        setErrorMsg('Sua conta possui Senha de 2 Etapas. Por favor, digite-a abaixo.');
      } else {
        // Sucesso!
        setStatus('conectada');
        setStep(1); // Reseta para o futuro
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'Código ou senha incorretos.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Tem certeza que deseja desconectar sua conta? As automações serão paralisadas.')) return;
    setLoadingAction(true);
    try {
      await telegramService.logout();
      setStatus('desconectada');
      setPhone('');
      setApiId('');
      setApiHash('');
      setCode('');
      setPassword('');
      setNeedsPassword(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="sessao-container centered">
        <Loader2 className="spinner-icon" size={40} />
        <p>Verificando status da sessão...</p>
      </div>
    );
  }

  return (
    <div className="sessao-container">
      <div className="sessao-header">
        <h1>Sessão do Telegram</h1>
        <p>Conecte sua conta para que o AutoPost possa encaminhar mídias e ler fóruns.</p>
      </div>

      {status === 'conectada' ? (
        <div className="status-card success-card">
          <div className="status-icon"><ShieldCheck size={48} /></div>
          <h2>Conta Conectada</h2>
          <p className="phone-display">{phone}</p>
          <p className="status-desc">O AutoPost está autorizado e pronto para operar suas automações.</p>
          <button className="btn-logout" onClick={handleLogout} disabled={loadingAction}>
            {loadingAction ? <Loader2 className="spin" size={20} /> : <LogOut size={20} />}
            Desconectar Conta
          </button>
        </div>
      ) : (
        <div className="connection-wrapper">
          <div className="info-panel">
            <h3><Info size={20}/> Como conectar?</h3>
            <ol>
              <li>Acesse <strong>my.telegram.org</strong> e faça login com seu número.</li>
              <li>Vá em <strong>API development tools</strong>.</li>
              <li>Crie um aplicativo qualquer para obter seu <strong>api_id</strong> e <strong>api_hash</strong>.</li>
              <li>Preencha os dados ao lado. Você receberá um código no seu aplicativo do Telegram.</li>
            </ol>
            <div className="security-note">
              <ShieldCheck size={16} color="#22c55e" />
              <span>Sua sessão é criptografada e usada apenas para os canais que você autorizar.</span>
            </div>
          </div>

          <div className="form-panel">
            {errorMsg && (
              <div className="error-banner">
                <AlertTriangle size={18} /> {errorMsg}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleRequestCode} className="sessao-form">
                <div className="form-group">
                  <label>Número do Telegram (com +55)</label>
                  <div className="input-wrapper">
                    <Smartphone size={18} />
                    <input 
                      type="text" 
                      placeholder="+5511999999999" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>API ID</label>
                  <div className="input-wrapper">
                    <Key size={18} />
                    <input 
                      type="text" 
                      placeholder="Ex: 1234567" 
                      value={apiId} 
                      onChange={e => setApiId(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>API Hash</label>
                  <div className="input-wrapper">
                    <Key size={18} />
                    <input 
                      type="text" 
                      placeholder="Ex: a1b2c3d4e5f6g7h8i9j0" 
                      value={apiHash} 
                      onChange={e => setApiHash(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loadingAction}>
                  {loadingAction ? <Loader2 className="spin" size={20} /> : 'Receber Código'} 
                  {!loadingAction && <ArrowRight size={18} />}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="sessao-form">
                <div className="step-back" onClick={() => { setStep(1); setErrorMsg(''); }}>
                  ← Voltar
                </div>
                <p className="instruction-text">Enviamos um código para o seu aplicativo do Telegram.</p>
                
                <div className="form-group">
                  <label>Código de Autenticação</label>
                  <div className="input-wrapper">
                    <Key size={18} />
                    <input 
                      type="text" 
                      placeholder="12345" 
                      value={code} 
                      onChange={e => setCode(e.target.value)}
                    />
                  </div>
                </div>

                {needsPassword && (
                  <div className="form-group slide-down">
                    <label>Senha de 2 Etapas (2FA)</label>
                    <div className="input-wrapper">
                      <ShieldCheck size={18} />
                      <input 
                        type="password" 
                        placeholder="Sua senha do Telegram" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loadingAction}>
                  {loadingAction ? <Loader2 className="spin" size={20} /> : 'Confirmar Conexão'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}