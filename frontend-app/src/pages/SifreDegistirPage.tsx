import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Cpu, Lock, ArrowRight } from 'lucide-react';

export default function SifreDegistirPage() {
    const [yeniSifre, setYeniSifre] = useState('');
    const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, token } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (yeniSifre !== yeniSifreTekrar) {
            setError('Şifreler eşleşmiyor!');
            return;
        }
        if (yeniSifre.length < 4) {
            setError('Şifre en az 4 karakter olmalıdır!');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(
                '/auther/sifreDegistir',
                { yeniSifre },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (res.data.token) {
                login(res.data.token);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Şifre değiştirilemedi!');
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
                        <div className="login-subtitle">Şifrenizi Değiştirin</div>
                    </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                    İlk girişinizde şifrenizi değiştirmeniz zorunludur. Lütfen yeni şifrenizi belirleyin.
                </p>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Yeni Şifre</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: 38 }}
                                type="password"
                                placeholder="••••••••"
                                value={yeniSifre}
                                onChange={(e) => setYeniSifre(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Yeni Şifre (Tekrar)</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: 38 }}
                                type="password"
                                placeholder="••••••••"
                                value={yeniSifreTekrar}
                                onChange={(e) => setYeniSifreTekrar(e.target.value)}
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
                            <><div className="spinner" /> Kaydediliyor...</>
                        ) : (
                            <>Şifremi Kaydet <ArrowRight size={15} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
