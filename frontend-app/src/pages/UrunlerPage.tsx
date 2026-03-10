import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Urun } from '../types';
import Modal from '../components/Modal';
import {
    Plus, Trash2, Pencil, Search, Package, AlertCircle, Download, Upload
} from 'lucide-react';

const EMPTY_FORM = { ad: '', fiyat: '', stok: '', kategori: '', ebat: '' };
const EXCEL_SUTUNLAR = ['Ürün Adı', 'Fiyat (₺)', 'Stok', 'Kategori', 'Ebat'];

export default function UrunlerPage() {
    const { hasYetki } = useAuth();
    const [urunler, setUrunler] = useState<Urun[]>([]);
    const [filtered, setFiltered] = useState<Urun[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sayfa, setSayfa] = useState(1);
    const SAYFA_BOYUTU = 25;
    const [modal, setModal] = useState<null | 'ekle' | 'guncelle' | 'importSonuc'>(null);
    const [secili, setSecili] = useState<Urun | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [importSonuc, setImportSonuc] = useState<{ eklenen: number; guncellenen: number; hatalar: string[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchUrunler = async () => {
        try {
            const res = await api.get('/urunler');
            setUrunler(res.data);
            setFiltered(res.data);
        } catch { setError('Ürünler yüklenemedi.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUrunler(); }, []);

    useEffect(() => {
        if (!search.trim()) { setFiltered(urunler); return; }
        const s = search.toLowerCase();
        setFiltered(urunler.filter(u => u.ad.toLowerCase().includes(s) || u.kategori.toLowerCase().includes(s)));
        setSayfa(1);
    }, [search, urunler]);

    const openEkle = () => { setForm(EMPTY_FORM); setModal('ekle'); };
    const openGuncelle = (u: Urun) => {
        setSecili(u);
        setForm({ ad: u.ad, fiyat: String(u.fiyat), stok: String(u.stok), kategori: u.kategori, ebat: u.ebat || '' });
        setModal('guncelle');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ad: form.ad,
                fiyat: Number(form.fiyat),
                stok: Number(form.stok),
                kategori: form.kategori,
                ...(form.ebat ? { ebat: form.ebat } : {}),
            };
            if (modal === 'ekle') {
                await api.post('/urunler', payload);
            } else if (secili) {
                await api.put(`/urunler/${secili.id}`, payload);
            }
            setModal(null);
            await fetchUrunler();
        } catch (e: any) {
            setError(e.response?.data || 'İşlem başarısız.');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        setSaving(true);
        try {
            await api.delete(`/urunler/${deleteId}`);
            setDeleteId(null);
            await fetchUrunler();
        } catch (e: any) {
            setError('Silme işlemi başarısız.');
        } finally { setSaving(false); }
    };

    // ── Excel Dışa Aktar ──────────────────────────────────────────────────────
    const handleExcelExport = () => {
        const satirlar = urunler.map(u => ({
            'Ürün Adı':  u.ad,
            'Fiyat (₺)': u.fiyat,
            'Stok':      u.stok,
            'Kategori':  u.kategori,
            'Ebat':      u.ebat || '',
        }));
        const ws = XLSX.utils.json_to_sheet(satirlar, { header: EXCEL_SUTUNLAR });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
        XLSX.writeFile(wb, `urunler_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // ── Excel İçe Aktar ──────────────────────────────────────────────────────
    const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';   // aynı dosya tekrar seçilebilsin

        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const satirlar: any[] = XLSX.utils.sheet_to_json(ws);

        // Sütun adlarını backend alanlarıyla eşle
        const urunListesi = satirlar.map(s => ({
            ad:       s['Ürün Adı']  ?? s['ad']       ?? '',
            fiyat:    s['Fiyat (₺)'] ?? s['fiyat']    ?? 0,
            stok:     s['Stok']      ?? s['stok']      ?? 0,
            kategori: s['Kategori']  ?? s['kategori']  ?? '',
            ebat:     s['Ebat']      ?? s['ebat']      ?? '',
        }));

        setSaving(true);
        try {
            const res = await api.post('/urunler/bulk-import', { urunler: urunListesi });
            setImportSonuc(res.data);
            setModal('importSonuc');
            await fetchUrunler();
        } catch (err: any) {
            setError(err.response?.data?.message || 'İçe aktarma başarısız.');
        } finally {
            setSaving(false);
        }
    };

    const formatTL = (n: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

    const formFields = (
        <>
            {error && <div className="form-error">{error}</div>}
            <div className="form-group">
                <label className="form-label">Ürün Adı *</label>
                <input className="form-input" value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} placeholder="Raspberry Pi 5 - 8GB" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                    <label className="form-label">Fiyat (₺) *</label>
                    <input className="form-input" type="number" value={form.fiyat} onChange={e => setForm(f => ({ ...f, fiyat: e.target.value }))} placeholder="0" required />
                </div>
                <div className="form-group">
                    <label className="form-label">Stok *</label>
                    <input className="form-input" type="number" value={form.stok} onChange={e => setForm(f => ({ ...f, stok: e.target.value }))} placeholder="0" required />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Kategori *</label>
                <input className="form-input" value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))} placeholder="Mikrodenetleyici" required />
            </div>
            <div className="form-group">
                <label className="form-label">Ebat <span style={{ color: 'var(--text-muted)' }}>(opsiyonel)</span></label>
                <input className="form-input" value={form.ebat} onChange={e => setForm(f => ({ ...f, ebat: e.target.value }))} placeholder="85mm x 56mm" />
            </div>
        </>
    );

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Ürün Yönetimi</h2>
                    <p className="page-desc">{filtered.length} ürün — sayfa {sayfa}/{Math.max(1, Math.ceil(filtered.length / SAYFA_BOYUTU))}</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            className="form-input"
                            placeholder="Ürün veya kategori ara..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Gizli file input — Excel import için */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={handleExcelImport}
                    />
                    {hasYetki('urun:okuma') && (
                        <button className="btn btn-secondary" onClick={handleExcelExport} title="Ürünleri Excel olarak indir">
                            <Download size={15} /> Excel İndir
                        </button>
                    )}
                    {hasYetki('urun:yazma') && (
                        <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={saving} title="Excel dosyasından ürün yükle">
                            <Upload size={15} /> {saving ? 'Yükleniyor...' : 'Excel Yükle'}
                        </button>
                    )}
                    {hasYetki('urun:yazma') && (
                        <button className="btn btn-primary" onClick={openEkle}>
                            <Plus size={15} /> Ürün Ekle
                        </button>
                    )}
                </div>
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading-page"><div className="spinner" /><span>Yükleniyor...</span></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state card-body"><Package /><p>Ürün bulunamadı</p></div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Ürün Adı</th>
                                    <th>Kategori</th>
                                    <th>Fiyat</th>
                                    <th>Stok</th>
                                    <th>Ebat</th>
                                    {(hasYetki('urun:yazma') || hasYetki('urun:silme')) && <th>İşlemler</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.slice((sayfa - 1) * SAYFA_BOYUTU, sayfa * SAYFA_BOYUTU).map(u => (
                                    <tr key={u.id}>
                                        <td className="td-muted font-mono">{u.id}</td>
                                        <td style={{ fontWeight: 500 }} className="truncate">{u.ad}</td>
                                        <td>
                                            <span className="badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent-hover)', border: '1px solid var(--border-active)' }}>
                                                {u.kategori}
                                            </span>
                                        </td>
                                        <td className="font-mono">{formatTL(u.fiyat)}</td>
                                        <td>
                                            <span className={`badge ${u.stok <= 10 ? 'badge-danger' : u.stok <= 50 ? 'badge-warning' : 'badge-success'}`}>
                                                {u.stok <= 10 && <AlertCircle size={10} />}{u.stok}
                                            </span>
                                        </td>
                                        <td className="td-muted">{u.ebat || '—'}</td>
                                        {(hasYetki('urun:yazma') || hasYetki('urun:silme')) && (
                                            <td>
                                                <div className="td-actions">
                                                    {hasYetki('urun:yazma') && (
                                                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openGuncelle(u)} title="Güncelle">
                                                            <Pencil size={13} />
                                                        </button>
                                                    )}
                                                    {hasYetki('urun:silme') && (
                                                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(u.id)} title="Sil">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Sayfalama */}
                        {Math.ceil(filtered.length / SAYFA_BOYUTU) > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderTop: '1px solid var(--border)' }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setSayfa(p => p - 1)}
                                    disabled={sayfa === 1}
                                >
                                    ← Önceki
                                </button>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 100, textAlign: 'center' }}>
                                    Sayfa {sayfa} / {Math.ceil(filtered.length / SAYFA_BOYUTU)}
                                </span>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setSayfa(p => p + 1)}
                                    disabled={sayfa >= Math.ceil(filtered.length / SAYFA_BOYUTU)}
                                >
                                    Sonraki →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Ekle/Güncelle Modal */}
            {(modal === 'ekle' || modal === 'guncelle') && (
                <Modal
                    title={modal === 'ekle' ? 'Yeni Ürün Ekle' : 'Ürün Güncelle'}
                    onClose={() => { setModal(null); setError(''); }}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => { setModal(null); setError(''); }}>İptal</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.ad || !form.fiyat || !form.stok || !form.kategori}>
                                {saving ? <><div className="spinner" /> Kaydediliyor...</> : modal === 'ekle' ? 'Ekle' : 'Güncelle'}
                            </button>
                        </>
                    }
                >
                    {formFields}
                </Modal>
            )}

            {/* Excel İçe Aktarma Sonuç Modal */}
            {modal === 'importSonuc' && importSonuc && (
                <Modal
                    title="Excel İçe Aktarma Tamamlandı"
                    onClose={() => setModal(null)}
                    footer={<button className="btn btn-primary" onClick={() => setModal(null)}>Tamam</button>}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, background: 'color-mix(in srgb, #22c55e 12%, transparent)', border: '1px solid #22c55e44', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{importSonuc.eklenen}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Yeni Eklendi</div>
                            </div>
                            <div style={{ flex: 1, background: 'color-mix(in srgb, var(--accent) 12%, transparent)', border: '1px solid var(--border-active)', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{importSonuc.guncellenen}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Güncellendi</div>
                            </div>
                        </div>
                        {importSonuc.hatalar.length > 0 && (
                            <div style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', border: '1px solid var(--danger)', borderRadius: 8, padding: '10px 14px' }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>
                                    {importSonuc.hatalar.length} satır atlandı:
                                </div>
                                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {importSonuc.hatalar.map((h, i) => <li key={i}>{h}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Sil Onay Modal */}
            {deleteId !== null && (
                <Modal
                    title="Ürünü Sil"
                    onClose={() => setDeleteId(null)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>İptal</button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                                {saving ? <><div className="spinner" /> Siliniyor...</> : <><Trash2 size={14} /> Sil</>}
                            </button>
                        </>
                    }
                >
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--danger)' }}>#{deleteId}</strong> numaralı ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </p>
                </Modal>
            )}
        </div>
    );
}
