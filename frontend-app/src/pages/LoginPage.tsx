import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Cpu, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auther/login', { email, sifre });
            if (res.data.token) {
                login(res.data.token);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Email veya şifre hatalı!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-glow" />
            <div className="login-bg-glow-2" />

            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">
                        <Cpu size={24} color="white" />
                    </div>
                    <div>
                        <div className="login-title">SAMM ERP</div>
                        <div className="login-subtitle">Yönetim Paneline Giriş</div>
                    </div>
                </div>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">E-posta</label>
                        <div style={{ position: 'relative' }}>
                            <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: 38 }}
                                type="email"
                                placeholder="emre@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Şifre</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: 38 }}
                                type="password"
                                placeholder="••••••••"
                                value={sifre}
                                onChange={(e) => setSifre(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <><div className="spinner" /> Giriş yapılıyor...</>
                        ) : (
                            <>Giriş Yap <ArrowRight size={15} /></>
                        )}
                    </button>
                </form>

                
            </div>
        </div>
    );
}
