import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import UrunGuncellePage from "./pages/UrunGuncellePage";
import TestPage from "./pages/TestPage";

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
              </div>
            </div>
          </div>
        </header>
        <div className="page-body">
          <Routes>
            <Route path="/" element={<UrunGuncellePage />} />
            <Route path="/urun-guncelle" element={<UrunGuncellePage />} />
            <Route path="/test" element={<TestPage />} />
            <Route
              path="/login"
              element={<Navigate to="/urun-guncelle" replace />}
            />
            <Route
              path="*"
              element={<Navigate to="/urun-guncelle" replace />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
