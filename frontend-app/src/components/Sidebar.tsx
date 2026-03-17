import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Package, ShoppingCart, Users, LogOut, Cpu,
    ShieldCheck, RefreshCw, FlaskConical, ChevronDown, Database, Plug
} from 'lucide-react';

interface NavItem {
    to: string;
    icon: React.ReactNode;
    label: string;
}

interface NavGroup {
    key: string;
    title: string;
    icon: React.ReactNode;
    items: NavItem[];
}

function SidebarGroup({ group }: { group: NavGroup }) {
    const [open, setOpen] = useState(true);

    return (
        <div>
            {/* Grup başlığı */}
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    borderRadius: 6,
                    transition: 'color 0.15s',
                    marginBottom: 2,
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {group.icon}
                    {group.title}
                </span>
                <ChevronDown
                    size={13}
                    style={{
                        transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s ease',
                    }}
                />
            </button>

            {/* Accordion içeriği */}
            <div
                style={{
                    overflow: 'hidden',
                    maxHeight: open ? 400 : 0,
                    transition: 'max-height 0.25s ease',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 4 }}>
                    {group.items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            style={{ paddingLeft: 20 }}
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Sidebar() {
    const { logout, isAdmin, hasYetki } = useAuth();

    const erpItems: NavItem[] = [
        { to: '/',           icon: <LayoutDashboard size={16} />, label: 'Dashboard'     },
        { to: '/urunler',    icon: <Package size={16} />,         label: 'Ürünler'       },
        { to: '/siparisler', icon: <ShoppingCart size={16} />,    label: 'Siparişler'    },
        ...(hasYetki('kullanici:okuma')
            ? [{ to: '/kullanicilar', icon: <Users size={16} />, label: 'Kullanıcılar' }]
            : []),
        ...(isAdmin
            ? [{ to: '/roller', icon: <ShieldCheck size={16} />, label: 'Rol Yönetimi' }]
            : []),
    ];

    const oracleItems: NavItem[] = [
        { to: '/urun-guncelle', icon: <RefreshCw size={16} />,    label: 'Ürün Güncelleme' },
        { to: '/test',          icon: <FlaskConical size={16} />, label: 'Test'             },
    ];

    const groups: NavGroup[] = [
        // { key: 'erp',    title: 'ERP',                icon: <Database size={11} />,  items: erpItems    },
        { key: 'oracle', title: 'Oracle Entegrasyon', icon: <Plug size={11} />,      items: oracleItems },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-logo">
                    <div className="brand-icon">
                        <Cpu size={18} color="white" />
                    </div>
                    <div className="brand-text">
                        <span className="brand-name">SAMM ERP</span>
                        <span className="brand-sub">Yönetim Paneli</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {groups.map((group, i) => (
                    <div key={group.key}>
                        <SidebarGroup group={group} />
                        {i < groups.length - 1 && (
                            <div style={{ height: 1, background: 'var(--border)', margin: '10px 8px' }} />
                        )}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-link" onClick={logout} style={{ color: '#ef4444' }}>
                    <LogOut size={16} />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}
