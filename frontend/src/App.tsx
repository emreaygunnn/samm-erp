//"Giriş yapmış mı? Yapmışsa şu sayfayı göster, yapmamışsa login'e at."

import {Routes,Route,Navigate} from "react-router-dom"; // Routes → Route'ların kabı. İçindeki Route'lara bakıp URL'e göre hangisini göstereceğine karar verir.
                                                       // Route → Tek bir sayfa tanımı. "Bu URL'e gelince bu component'i göster."
                                                       // Navigate → Otomatik yönlendirme. "Buraya geldin ama seni şuraya atıyorum."

import {useAuth} from  "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import UpdateProductPage from "./pages/UpdateProductPage";
import Sidebar from "./components/SideBarComponent";
import TestPage from "./pages/TestPage";""

function App(){
  const { token, user, logout } = useAuth();
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
            <h1>SAMM ERP</h1>
            <p>Yönetim Paneli</p>
          </div>
          <div className="header-right">
            <div className="user-pill">
              <div className="user-avatar">
                {user?.user?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.user}</span>
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


