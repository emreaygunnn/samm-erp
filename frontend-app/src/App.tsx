import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UrunlerPage from './pages/UrunlerPage';
import SiparislerPage from './pages/SiparislerPage';
import KullanicilarPage from './pages/KullanicilarPage';
import RollerPage from './pages/RollerPage';
import SifreDegistirPage from './pages/SifreDegistirPage';

function App() {
  const { token, user } = useAuth();

  // Giriş yapılmamışsa → login sayfasına yönlendir
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // İlk girişte şifre değişikliği zorunluysa → sifre-degistir sayfasına kilitle
  if (user?.sifreDegistirmesiGerekiyor) {
    return (
      <Routes>
        <Route path="/sifre-degistir" element={<SifreDegistirPage />} />
        <Route path="*" element={<Navigate to="/sifre-degistir" replace />} />
      </Routes>
    );
  }

  // Giriş yapılmışsa → tam layout
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>SAMM ERP</h1>
            <p>Yönetim Paneli</p>
          </div>
          <div className="header-right">
            <div className="user-pill">
              <div className="user-avatar">
                {user?.kullanici?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.kullanici}</span>
                <span className="user-role">{user?.rol}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="page-body">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/urunler" element={<UrunlerPage />} />
            <Route path="/siparisler" element={<SiparislerPage />} />
            <Route path="/kullanicilar" element={<KullanicilarPage />} />
            <Route path="/roller" element={<RollerPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;

