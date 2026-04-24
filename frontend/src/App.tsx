//"Giriş yapmış mı? Yapmışsa şu sayfayı göster, yapmamışsa login'e at."

import {Routes,Route,Navigate} from "react-router-dom"; // Routes → Route'ların kabı. İçindeki Route'lara bakıp URL'e göre hangisini göstereceğine karar verir.
                                                       // Route → Tek bir sayfa tanımı. "Bu URL'e gelince bu component'i göster."
                                                       // Navigate → Otomatik yönlendirme. "Buraya geldin ama seni şuraya atıyorum."
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {useAuth} from  "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import UpdateProductPage from "./pages/UpdateProductPage";
import Sidebar from "./components/SideBarComponent";
import TestPage from "./pages/TestPage";""

function App(){
  const { token, user, logout } = useAuth();
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  //// Giriş yapılmamışsa → login sayfasına yönlendir
  if(!token){
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
            <h1>{t('common.appName')}</h1>
            <p>{t('navigation.adminPanel')}</p>
          </div>
          <div className="header-right">
            {/* Dil Seçimi */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
              }}>
                <Globe size={16} color="var(--text-secondary)" />
                <select
                  value={i18n.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  style={{
                    background: 'black',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    outline: 'none',
                    colorScheme: 'dark',
                  }}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>

              
            </div>
            
          </div>
        </header>
        <div className="page-body"> 
          <Routes>
            <Route path="/urun-guncelle" element={<UpdateProductPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/login" element={<Navigate to="/urun-guncelle" replace />} />// login sayfasına gelirse urun-guncelle sayfasına yönlendirir
            <Route path="*" element={<Navigate to="/urun-guncelle" replace />} />// her hangi bir url girilirse urun-guncelle sayfasına yönlendirir
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;