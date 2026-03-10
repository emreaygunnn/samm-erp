import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Kullanici, Rol } from '../types';
import Modal from '../components/Modal';
import { UserPlus, Trash2, Shield, Pencil } from 'lucide-react';

const BOŞ_FORM = { ad: '', soyad: '', email: '', sifre: '', rol: '', no: '', aciklama: '' };

const ROL_ETİKET: Record<string, string> = {
    admin: 'Yönetici',
    editor: 'Editör',
    stajyer: 'Stajyer',
};

export default function KullanicilarPage() {
    const { hasYetki, login } = useAuth();
    const [liste, setListe] = useState<Kullanici[]>([]);
    const [roller, setRoller] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'ekle' | 'duzenle' | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(BOŞ_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchKullanicilar = async () => {
        try {
            const res = await api.get('/kullanicilar');
            setListe(res.data);
        } catch {
            setError('Erişim engellendi veya sunucu hatası.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoller = async () => {
        try {
            const res = await api.get('/roller');
            setRoller(res.data);
        } catch (e: any) {
            console.error('Roller yüklenemedi:', e.response?.data || e.message);
        }
    };

    useEffect(() => {
        fetchRoller();
        if (hasYetki('kullanici:okuma')) fetchKullanicilar();
    }, []);

    if (!hasYetki('kullanici:okuma')) {
        return (
            <div className="empty-state">
                <Shield size={48} color="var(--danger)" />
                <h2 style={{ marginTop: 16 }}>Erişim Yetkiniz Yok</h2>
                <p>Bu sayfayı sadece yöneticiler görüntüleyebilir.</p>
            </div>
        );
    }

    const handleEkleAc = () => {
        setError('');
        setForm({ ...BOŞ_FORM, rol: roller[0]?._id ?? '' });
        setEditId(null);
        setModal('ekle');
    };

    const handleDuzenleAc = (k: Kullanici) => {
        setError('');
        setForm({
            ad: k.ad,
            soyad: k.soyad ?? '',
            email: k.email ?? '',
            sifre: '',                 // şifre boş gelir, değiştirilmek istenirse doldurulur
            rol: k.rol._id,
            no: k.no ?? '',
            aciklama: k.aciklama ?? '',
        });
        setEditId(k.id);
        setModal('duzenle');
    };

    const handleSave = async () => {
        if (!form.rol) { setError('Lütfen bir rol seçin.'); return; }
        if (modal === 'ekle') {
            if (!form.email.trim()) { setError('E-posta zorunludur.'); return; }
            if (!form.sifre.trim()) { setError('Şifre zorunludur.'); return; }
        }
        setSaving(true);
        setError('');
        try {
            if (modal === 'ekle') {
                await api.post('/kullanicilar', form);
            } else {
                // Şifre boşsa güncellemede gönderme
                const { sifre, ...geriKalan } = form;
                const veri = sifre.trim() ? form : geriKalan;
                const res = await api.put(`/kullanicilar/${editId}`, veri);
                // Kendi profilini güncellediyse backend yeni token döner — header'ı güncelle
                if (res.data?.yeniToken) login(res.data.yeniToken);
            }
            setModal(null);
            await fetchKullanicilar();
        } catch (e: any) {
            setError(e.response?.data?.message || 'İşlem başarısız.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setSaving(true);
        try {
            await api.delete(`/kullanicilar/${deleteId}`);
            setDeleteId(null);
            await fetchKullanicilar();
        } catch {
            setError('Silme işlemi başarısız.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h2 className="page-title">Kullanıcı Yönetimi</h2>
                    <p className="page-desc">Sistem erişimi olan personeller</p>
                </div>
                {hasYetki('kullanici:yazma') && (
                    <button className="btn btn-primary" onClick={handleEkleAc}>
                        <UserPlus size={15} /> Kullanıcı Ekle
                    </button>
                )}
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading-page"><div className="spinner" /><span>Yükleniyor...</span></div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ad Soyad</th>
                                    <th>Rol</th>
                                    <th>Sicil / Öğrenci No</th>
                                    <th>Açıklama</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {liste.map(k => (
                                    <tr key={k.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="user-avatar">{k.ad[0]}</div>
                                                <div className="flex flex-col">
                                                    <span style={{ fontWeight: 600 }}>{k.ad} {k.soyad}</span>
                                                    <span className="td-muted" style={{ fontSize: 11 }}>{k.email || '—'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${k.rol.ad}`}>
                                                {ROL_ETİKET[k.rol.ad] ?? k.rol.ad}
                                            </span>
                                        </td>
                                        <td className="td-muted font-mono">{k.no || '—'}</td>
                                        <td className="td-muted truncate" title={k.aciklama}>{k.aciklama || '—'}</td>
                                        <td style={{ display: 'flex', gap: 6 }}>
                                            {hasYetki('kullanici:yazma') && (
                                                <button
                                                    className="btn btn-secondary btn-sm btn-icon"
                                                    title="Düzenle"
                                                    onClick={() => handleDuzenleAc(k)}
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                            )}
                                            {hasYetki('kullanici:silme') && (
                                                <button
                                                    className="btn btn-danger btn-sm btn-icon"
                                                    title="Sil"
                                                    onClick={() => setDeleteId(k.id)}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </td>
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
                    title={modal === 'ekle' ? 'Yeni Personel Ekle' : 'Personeli Düzenle'}
                    onClose={() => { setModal(null); setError(''); }}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setModal(null)}>İptal</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? <><div className="spinner" /> Kaydediliyor...</> : 'Kaydet'}
                            </button>
                        </>
                    }
                >
                    {error && <div className="form-error">{error}</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Ad</label>
                            <input className="form-input" value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Soyad</label>
                            <input className="form-input" value={form.soyad} onChange={e => setForm(f => ({ ...f, soyad: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">E-posta</label>
                            <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Şifre {modal === 'duzenle' && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(boş bırakılırsa değişmez)</span>}
                            </label>
                            <input className="form-input" type="password" value={form.sifre} onChange={e => setForm(f => ({ ...f, sifre: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sicil / Öğrenci No</label>
                            <input className="form-input" value={form.no} onChange={e => setForm(f => ({ ...f, no: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Rol</label>
                            <select className="form-select" value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                                {roller.map(r => (
                                    <option key={r._id} value={r._id}>
                                        {ROL_ETİKET[r.ad] ?? r.ad}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Açıklama</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            style={{ resize: 'none' }}
                            value={form.aciklama}
                            onChange={e => setForm(f => ({ ...f, aciklama: e.target.value }))}
                            placeholder="Personel hakkında not..."
                        />
                    </div>
                </Modal>
            )}

            {/* Sil Onay Modal */}
            {deleteId !== null && (
                <Modal
                    title="Kullanıcıyı Sil"
                    onClose={() => setDeleteId(null)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>İptal</button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                                {saving ? <><div className="spinner" /> Siliniyor...</> : 'Kullanıcıyı Sil'}
                            </button>
                        </>
                    }
                >
                    <p style={{ color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--danger)' }}>#{deleteId}</strong> nolu personeli silmek istediğinize emin misiniz?
                    </p>
                </Modal>
            )}
        </div>
    );
}
