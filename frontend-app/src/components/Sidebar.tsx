import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Package, ShoppingCart, Users, LogOut, Cpu, ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
    const { logout, isAdmin, hasYetki } = useAuth();

    const navItems = [
        { to: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
        { to: '/urunler', icon: <Package />, label: 'Ürünler' },
        { to: '/siparisler', icon: <ShoppingCart />, label: 'Siparişler' },
        ...(hasYetki('kullanici:okuma') ? [{ to: '/kullanicilar', icon: <Users />, label: 'Kullanıcılar' }] : []),
        ...(isAdmin ? [{ to: '/roller', icon: <ShieldCheck />, label: 'Rol Yönetimi' }] : []),
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

            <nav className="sidebar-nav">
                <span className="nav-section-label">Menü</span>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
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
