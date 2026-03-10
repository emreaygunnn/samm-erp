import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Urun, Siparis } from '../types';
import { Package, ShoppingCart, TrendingUp, Layers, AlertTriangle } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    color: string;
    sub?: string;
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: color }}>
                {icon}
            </div>
            <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
                {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [urunler, setUrunler] = useState<Urun[]>([]);
    const [siparisler, setSiparisler] = useState<Siparis[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [urunRes, sipRes] = await Promise.all([
                    api.get('/urunler'),
                    api.get('/siparisler'),
                ]);
                setUrunler(urunRes.data);
                setSiparisler(sipRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const toplamStokDegeri = urunler.reduce((acc, u) => acc + u.fiyat * u.stok, 0);
    const toplamSiparisTutar = siparisler.reduce((acc, s) => acc + s.toplamTutar, 0);
    const kritikStok = urunler.filter((u) => u.stok <= 10).length;

    const formatTL = (n: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                <span>Veriler yükleniyor...</span>
            </div>
        );
    }

    const rolBadge = user?.rol === 'admin' ? 'admin' : user?.rol === 'editor' ? 'editor' : 'stajyer';
    const rolLabel = user?.rol === 'admin' ? 'Yönetici' : user?.rol === 'editor' ? 'Editör' : 'Stajyer';

    return (
        <div>
            {/* Hoş geldin */}

            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
                            Hoş geldin, {user?.kullanici?.normalize?.('NFC')} 👋
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                            Sistemin anlık durumuna genel bir bakış
                        </p>
                    </div>
                    <span className={`badge badge-${rolBadge}`}>{rolLabel}</span>
                </div>
            </div>

            {/* Stat Kartları */}
            <div className="stat-grid">
                <StatCard
                    label="Toplam Ürün"
                    value={urunler.length}
                    icon={<Package size={20} color="#6366f1" />}
                    color="rgba(99,102,241,0.15)"
                    sub={`${kritikStok} kritik stok`}
                />
                <StatCard
                    label="Stok Değeri"
                    value={formatTL(toplamStokDegeri)}
                    icon={<TrendingUp size={20} color="#10b981" />}
                    color="rgba(16,185,129,0.15)"
                    sub="Tüm ürünler"
                />
                <StatCard
                    label="Toplam Sipariş"
                    value={siparisler.length}
                    icon={<ShoppingCart size={20} color="#f59e0b" />}
                    color="rgba(245,158,11,0.15)"
                    sub="Tüm zamanlar"
                />
                <StatCard
                    label="Sipariş Tutarı"
                    value={formatTL(toplamSiparisTutar)}
                    icon={<Layers size={20} color="#a78bfa" />}
                    color="rgba(167,139,250,0.15)"
                    sub="Toplam gelir"
                />
            </div>

            {/* Kritik Stok Uyarıları */}
            {kritikStok > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertTriangle size={16} color="var(--warning)" />
                                    Kritik Stok Uyarısı
                                </div>
                                <div className="card-subtitle">Stok miktarı 10 ve altı olan ürünler</div>
                            </div>
                            <span className="badge badge-warning">{kritikStok} Ürün</span>
                        </div>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ürün Adı</th>
                                        <th>Kategori</th>
                                        <th>Stok</th>
                                        <th>Birim Fiyat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {urunler.filter(u => u.stok <= 10).map(u => (
                                        <tr key={u.id}>
                                            <td>{u.ad}</td>
                                            <td className="td-muted">{u.kategori}</td>
                                            <td><span className="badge badge-danger">{u.stok} adet</span></td>
                                            <td className="font-mono">{formatTL(u.fiyat)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Son Siparişler */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Son Siparişler</div>
                        <div className="card-subtitle">En güncel sipariş kayıtları</div>
                    </div>
                    <span className="badge badge-success">{siparisler.length} Toplam</span>
                </div>
                {siparisler.length === 0 ? (
                    <div className="empty-state card-body">
                        <ShoppingCart />
                        <p>Henüz sipariş bulunmuyor</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Ürün</th>
                                    <th>Adet</th>
                                    <th>Toplam Tutar</th>
                                    <th>Oluşturan</th>
                                    <th>Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...siparisler].reverse().slice(0, 10).map((s) => (
                                    <tr key={s.id}>
                                        <td className="td-muted font-mono">#{s.id}</td>
                                        <td style={{ fontWeight: 500 }}>{s.urunAd}</td>
                                        <td className="td-muted">{s.adet} adet</td>
                                        <td className="font-mono" style={{ color: 'var(--success)' }}>{formatTL(s.toplamTutar)}</td>
                                        <td className="td-muted">{s.olusturan}</td>
                                        <td className="td-muted" style={{ fontSize: 12 }}>{s.tarih}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
