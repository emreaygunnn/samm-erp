import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../types';
import Modal from '../components/Modal';
import { Shield, Plus, Trash2, Check, X } from 'lucide-react';

const YETKİ_GRUPLARI = [
    {
        grup: 'Kullanıcılar',
        yetkiler: [
            { key: 'kullanici:okuma',  etiket: 'Görüntüle' },
            { key: 'kullanici:yazma',  etiket: 'Ekle / Düzenle' },
            { key: 'kullanici:silme',  etiket: 'Sil' },
        ],
    },
    {
        grup: 'Ürünler',
        yetkiler: [
            { key: 'urun:okuma',  etiket: 'Görüntüle' },
            { key: 'urun:yazma',  etiket: 'Ekle / Düzenle' },
            { key: 'urun:silme',  etiket: 'Sil' },
        ],
    },
    {
        grup: 'Siparişler',
        yetkiler: [
            { key: 'siparis:okuma',  etiket: 'Görüntüle' },
            { key: 'siparis:yazma',  etiket: 'Oluştur' },
            { key: 'siparis:silme',  etiket: 'Sil' },
        ],
    },
];

const rolEtiket = (ad: string) => {
    const sabit: Record<string, string> = { editor: 'Editör', stajyer: 'Stajyer' };
    return sabit[ad] ?? (ad.charAt(0).toUpperCase() + ad.slice(1));
};

// Seçili/seçisiz toggle chip bileşeni
function YetkiChip({ aktif, onClick, etiket }: { aktif: boolean; onClick: () => void; etiket: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: `1.5px solid ${aktif ? 'var(--accent)' : 'var(--border)'}`,
                background: aktif ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
                color: aktif ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all .15s',
            }}
        >
            {aktif ? <Check size={11} /> : <X size={11} />}
            {etiket}
        </button>
    );
}

export default function RollerPage() {
    const { isAdmin } = useAuth();
    const [roller, setRoller]       = useState<Rol[]>([]);
    const [loading, setLoading]     = useState(true);
    const [yetkiMap, setYetkiMap]   = useState<Record<string, Set<string>>>({});
    const [saving, setSaving]       = useState<string | null>(null);
    const [mesajMap, setMesajMap]   = useState<Record<string, { text: string; ok: boolean }>>({});
    const [deleteId, setDeleteId]   = useState<string | null>(null);
    const [deleting, setDeleting]   = useState(false);
    const [deleteErr, setDeleteErr] = useState('');

    // Yeni rol modal
    const [yeniModal, setYeniModal]     = useState(false);
    const [yeniAd, setYeniAd]           = useState('');
    const [yeniYetkiler, setYeniYetkiler] = useState<Set<string>>(new Set());
    const [yeniSaving, setYeniSaving]   = useState(false);
    const [yeniHata, setYeniHata]       = useState('');

    const fetchRoller = async () => {
        const res = await api.get('/roller');
        const data: Rol[] = res.data;
        setRoller(data);
        const map: Record<string, Set<string>> = {};
        data.forEach(r => { map[r._id] = new Set(r.yetkiler); });
        setYetkiMap(map);
    };

    useEffect(() => { fetchRoller().finally(() => setLoading(false)); }, []);

    if (!isAdmin) {
        return (
            <div className="empty-state">
                <Shield size={48} color="var(--danger)" />
                <h2 style={{ marginTop: 16 }}>Erişim Yetkiniz Yok</h2>
                <p>Bu sayfayı sadece yöneticiler görüntüleyebilir.</p>
            </div>
        );
    }

    const toggle = (rolId: string, yetki: string) =>
        setYetkiMap(prev => {
            const s = new Set(prev[rolId]);
            s.has(yetki) ? s.delete(yetki) : s.add(yetki);
            return { ...prev, [rolId]: s };
        });

    const toggleYeni = (yetki: string) =>
        setYeniYetkiler(prev => {
            const s = new Set(prev);
            s.has(yetki) ? s.delete(yetki) : s.add(yetki);
            return s;
        });

    const handleKaydet = async (rolId: string) => {
        setSaving(rolId);
        try {
            await api.put(`/roller/${rolId}`, { yetkiler: [...yetkiMap[rolId]] });
            setMesajMap(p => ({ ...p, [rolId]: { text: 'Kaydedildi!', ok: true } }));
            setTimeout(() => setMesajMap(p => ({ ...p, [rolId]: { text: '', ok: true } })), 2500);
        } catch (e: any) {
            setMesajMap(p => ({ ...p, [rolId]: { text: e.response?.data?.message || 'Hata!', ok: false } }));
        } finally { setSaving(null); }
    };

    const handleSil = async () => {
        if (!deleteId) return;
        setDeleting(true);
        setDeleteErr('');
        try {
            await api.delete(`/roller/${deleteId}`);
            setDeleteId(null);
            await fetchRoller();
        } catch (e: any) {
            setDeleteErr(e.response?.data?.message || 'Silinemedi.');
        } finally { setDeleting(false); }
    };

    const handleYeniRolKaydet = async () => {
        if (!yeniAd.trim()) { setYeniHata('Rol adı zorunludur!'); return; }
        setYeniSaving(true); setYeniHata('');
        try {
            await api.post('/roller', { ad: yeniAd.trim(), yetkiler: [...yeniYetkiler] });
            setYeniModal(false); setYeniAd(''); setYeniYetkiler(new Set());
            await fetchRoller();
        } catch (e: any) {
            setYeniHata(e.response?.data?.message || 'Oluşturulamadı.');
        } finally { setYeniSaving(false); }
    };

    if (loading) return <div className="loading-page"><div className="spinner" /><span>Yükleniyor...</span></div>;

    const duzenlenebilirRoller = roller.filter(r => r.ad !== 'admin');

    return (
        <div>
            {/* Başlık */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Rol Yönetimi</h2>
                    <p className="page-desc">Rolleri düzenle, yetki ata veya sil</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setYeniAd(''); setYeniYetkiler(new Set()); setYeniHata(''); setYeniModal(true); }}>
                    <Plus size={15} /> Yeni Rol
                </button>
            </div>

            {/* Bilgi notu */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                Yetki değişikliklerinin etkili olması için etkilenen kullanıcıların <strong style={{ color: 'var(--text-primary)' }}>çıkış yapıp tekrar giriş yapması</strong> gerekir.
            </div>

            {/* Rol kartları */}
            <div style={{ display: 'grid', gap: 16 }}>
                {duzenlenebilirRoller.map(rol => {
                    const aktifSayisi = yetkiMap[rol._id]?.size ?? 0;
                    const mesaj = mesajMap[rol._id];
                    return (
                        <div key={rol._id} className="card">
                            {/* Kart başlığı */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className={`badge badge-${rol.ad}`} style={{ fontSize: 13, padding: '5px 12px' }}>
                                        {rolEtiket(rol.ad)}
                                    </span>
                                    <span className="td-muted" style={{ fontSize: 12 }}>
                                        {aktifSayisi} / 9 yetki aktif
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {mesaj?.text && (
                                        <span style={{ fontSize: 12, color: mesaj.ok ? '#22c55e' : 'var(--danger)' }}>
                                            {mesaj.text}
                                        </span>
                                    )}
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleKaydet(rol._id)}
                                        disabled={saving === rol._id}
                                    >
                                        {saving === rol._id ? <><div className="spinner" /> Kaydediliyor...</> : 'Kaydet'}
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm btn-icon"
                                        title="Rolü Sil"
                                        onClick={() => { setDeleteErr(''); setDeleteId(rol._id); }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Yetki grupları — toggle chip'ler */}
                            <div style={{ display: 'grid', gap: 14 }}>
                                {YETKİ_GRUPLARI.map(grup => (
                                    <div key={grup.grup} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                        <span style={{ width: 100, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
                                            {grup.grup}
                                        </span>
                                        {grup.yetkiler.map(y => (
                                            <YetkiChip
                                                key={y.key}
                                                aktif={yetkiMap[rol._id]?.has(y.key) ?? false}
                                                onClick={() => toggle(rol._id, y.key)}
                                                etiket={y.etiket}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Yeni Rol Modal */}
            {yeniModal && (
                <Modal
                    title="Yeni Rol Oluştur"
                    onClose={() => setYeniModal(false)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setYeniModal(false)}>İptal</button>
                            <button className="btn btn-primary" onClick={handleYeniRolKaydet} disabled={yeniSaving}>
                                {yeniSaving ? <><div className="spinner" /> Oluşturuluyor...</> : 'Oluştur'}
                            </button>
                        </>
                    }
                >
                    {yeniHata && <div className="form-error">{yeniHata}</div>}
                    <div className="form-group">
                        <label className="form-label">Rol Adı</label>
                        <input
                            className="form-input"
                            placeholder="örn: muhasebe, depo, moderator"
                            value={yeniAd}
                            onChange={e => setYeniAd(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" style={{ marginBottom: 12 }}>Yetkiler</label>
                        <div style={{ display: 'grid', gap: 12 }}>
                            {YETKİ_GRUPLARI.map(grup => (
                                <div key={grup.grup} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <span style={{ width: 100, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
                                        {grup.grup}
                                    </span>
                                    {grup.yetkiler.map(y => (
                                        <YetkiChip
                                            key={y.key}
                                            aktif={yeniYetkiler.has(y.key)}
                                            onClick={() => toggleYeni(y.key)}
                                            etiket={y.etiket}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}

            {/* Sil Onay Modal */}
            {deleteId && (
                <Modal
                    title="Rolü Sil"
                    onClose={() => setDeleteId(null)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>İptal</button>
                            <button className="btn btn-danger" onClick={handleSil} disabled={deleting}>
                                {deleting ? <><div className="spinner" /> Siliniyor...</> : 'Rolü Sil'}
                            </button>
                        </>
                    }
                >
                    {deleteErr
                        ? <div className="form-error">{deleteErr}</div>
                        : <p style={{ color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--danger)' }}>
                                "{rolEtiket(roller.find(r => r._id === deleteId)?.ad ?? '')}"
                            </strong>{' '}
                            rolünü kalıcı olarak silmek istediğinize emin misiniz?
                          </p>
                    }
                </Modal>
            )}
        </div>
    );
}
