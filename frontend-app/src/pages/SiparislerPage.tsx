import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Siparis, Urun } from '../types';
import Modal from '../components/Modal';
import { Plus, Trash2, ShoppingCart, Pencil } from 'lucide-react';

const formatTL = (n: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

export default function SiparislerPage() {
    const { hasYetki } = useAuth();
    const [siparisler, setSiparisler] = useState<Siparis[]>([]);
    const [urunler, setUrunler]       = useState<Urun[]>([]);
    const [loading, setLoading]       = useState(true);
    const [modal, setModal]           = useState<'ekle' | 'duzenle' | null>(null);
    const [editId, setEditId]         = useState<string | null>(null);
    const [form, setForm]             = useState({ urunId: '', adet: '1' });
    const [saving, setSaving]         = useState(false);
    const [deleteId, setDeleteId]     = useState<string | null>(null);
    const [error, setError]           = useState('');

    const fetchData = async () => {
        try {
            const [sipRes, urunRes] = await Promise.all([
                api.get('/siparisler'),
                api.get('/urunler'),
            ]);
            setSiparisler(sipRes.data);
            setUrunler(urunRes.data);
        } catch { setError('Veriler yüklenemedi.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleEkleAc = () => {
        setForm({ urunId: '', adet: '1' });
        setEditId(null);
        setError('');
        setModal('ekle');
    };

    const handleDuzenleAc = (s: Siparis) => {
        setForm({ urunId: s.urunId, adet: String(s.adet) });
        setEditId(s.id);
        setError('');
        setModal('duzenle');
    };

    const handleSave = async () => {
        if (!form.urunId || !form.adet) return;
        setSaving(true); setError('');
        try {
            if (modal === 'ekle') {
                await api.post('/siparisler', { urunId: form.urunId, adet: Number(form.adet) });
            } else {
                await api.put(`/siparisler/${editId}`, { urunId: form.urunId, adet: Number(form.adet) });
            }
            setModal(null);
            await fetchData();
        } catch (e: any) {
            setError(e.response?.data?.mesaj || 'İşlem başarısız.');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setSaving(true);
        try {
            await api.delete(`/siparisler/${deleteId}`);
            setDeleteId(null);
            await fetchData();
        } catch { setError('Silme işlemi başarısız.'); }
        finally { setSaving(false); }
    };

    const seciliUrun = urunler.find(u => u.id === form.urunId);
    // Düzenleme modunda mevcut siparişteki eski ürünü de stoka ekleyerek hesapla
    const mevcutSiparis = modal === 'duzenle' ? siparisler.find(s => s.id === editId) : null;
    const kullanilabilirStok = seciliUrun
        ? seciliUrun.stok + (mevcutSiparis?.urunId === form.urunId ? mevcutSiparis.adet : 0)
        : 0;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Sipariş Yönetimi</h2>
                    <p className="page-desc">Sistemdeki tüm sipariş kayıtları</p>
                </div>
                {hasYetki('siparis:yazma') && (
                    <button className="btn btn-primary" onClick={handleEkleAc}>
                        <Plus size={15} /> Yeni Sipariş
                    </button>
                )}
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading-page"><div className="spinner" /><span>Yükleniyor...</span></div>
                ) : siparisler.length === 0 ? (
                    <div className="empty-state card-body"><ShoppingCart /><p>Henüz sipariş bulunmuyor</p></div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Ürün</th>
                                    <th>Adet</th>
                                    <th>Birim Fiyat</th>
                                    <th>Toplam</th>
                                    <th>Oluşturan</th>
                                    <th>Tarih</th>
                                    {(hasYetki('siparis:yazma') || hasYetki('siparis:silme')) && <th>İşlemler</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {[...siparisler].reverse().map(s => (
                                    <tr key={s.id}>
                                        <td className="td-muted font-mono">#{s.id}</td>
                                        <td style={{ fontWeight: 500 }}>{s.urunAd}</td>
                                        <td className="td-muted">{s.adet} adet</td>
                                        <td className="font-mono">{formatTL(s.birimFiyat)}</td>
                                        <td className="font-mono" style={{ color: 'var(--success)', fontWeight: 600 }}>{formatTL(s.toplamTutar)}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="user-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{s.olusturan[0]}</div>
                                                <span style={{ fontSize: 13 }}>{s.olusturan}</span>
                                            </div>
                                        </td>
                                        <td className="td-muted" style={{ fontSize: 12 }}>{s.tarih}</td>
                                        {(hasYetki('siparis:yazma') || hasYetki('siparis:silme')) && (
                                            <td style={{ display: 'flex', gap: 6 }}>
                                                {hasYetki('siparis:yazma') && (
                                                    <button
                                                        className="btn btn-secondary btn-sm btn-icon"
                                                        title="Düzenle"
                                                        onClick={() => handleDuzenleAc(s)}
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                )}
                                                {hasYetki('siparis:silme') && (
                                                    <button
                                                        className="btn btn-danger btn-sm btn-icon"
                                                        title="Sil"
                                                        onClick={() => setDeleteId(s.id)}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Ekle / Düzenle Modal */}
            {modal && (
                <Modal
                    title={modal === 'ekle' ? 'Yeni Sipariş Oluştur' : 'Siparişi Düzenle'}
                    onClose={() => { setModal(null); setError(''); }}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setModal(null)}>İptal</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving || !form.urunId || !form.adet}
                            >
                                {saving ? <><div className="spinner" /> İşleniyor...</> : modal === 'ekle' ? 'Sipariş Oluştur' : 'Güncelle'}
                            </button>
                        </>
                    }
                >
                    {error && <div className="form-error">{error}</div>}
                    <div className="form-group">
                        <label className="form-label">Ürün Seçin</label>
                        <select
                            className="form-select"
                            value={form.urunId}
                            onChange={e => setForm(f => ({ ...f, urunId: e.target.value, adet: '1' }))}
                        >
                            <option value="">Ürün seçiniz...</option>
                            {urunler.map(u => (
                                <option key={u.id} value={u.id} disabled={u.stok <= 0 && u.id !== mevcutSiparis?.urunId}>
                                    {u.ad} ({u.stok} stokta) — {formatTL(u.fiyat)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Adet</label>
                        <input
                            className="form-input"
                            type="number"
                            min="1"
                            max={kullanilabilirStok || 1}
                            value={form.adet}
                            onChange={e => setForm(f => ({ ...f, adet: e.target.value }))}
                        />
                    </div>
                    {seciliUrun && (
                        <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                                <span className="td-muted">Birim Fiyat:</span>
                                <span className="font-mono">{formatTL(seciliUrun.fiyat)}</span>
                            </div>
                            <div className="flex justify-between items-center" style={{ fontSize: 16, fontWeight: 700 }}>
                                <span>Toplam Tutar:</span>
                                <span style={{ color: 'var(--accent-hover)' }}>{formatTL(seciliUrun.fiyat * Number(form.adet))}</span>
                            </div>
                        </div>
                    )}
                </Modal>
            )}

            {/* Sil Onay Modal */}
            {deleteId && (
                <Modal
                    title="Siparişi Sil"
                    onClose={() => setDeleteId(null)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>İptal</button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                                {saving ? <><div className="spinner" /> Siliniyor...</> : 'Siparişi Sil'}
                            </button>
                        </>
                    }
                >
                    <p style={{ color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--danger)' }}>#{deleteId}</strong> nolu sipariş silinecek ve stoğu iade edilecek. Emin misiniz?
                    </p>
                </Modal>
            )}
        </div>
    );
}
