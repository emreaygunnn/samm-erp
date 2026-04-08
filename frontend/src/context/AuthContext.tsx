//Uygulama içinde hangi kullanıcının giriş yaptığını, biletinin (token) ne olduğunu ve bu bilgilerin tüm sayfalara nasıl dağıtılacağını yönetir.
import { createContext, useContext, useState } from "react"; //createContext:ortak alan oluşturur, useContext:ortak alana erişir, useState:değişken tanımlar
import type { ReactNode } from "react";
import type { AuthUser } from "@shared/types/authUser";


interface AuthContextType {
    token: string | null; // jwt token
    user: AuthUser | null; // kullanıcı bilgisi
    login: (token: string) => void, // giriş yapma fonksiyonu
    logout: () => void // çıkış yapma fonksiyonu
}


const AuthContext = createContext<AuthContextType | null>(null); // AuthContext adında bir ortak alan oluşturur ve başlangıç değeri null'dır

// JWT token üç parçadan oluşur:
// eyJhbGciOiJ.eyJpZCI6IjEiLCJ1c2VyIjoiYWRtaW4ifQ.imza
//     HEADER          PAYLOAD                              SIGNATURE

// Ortadaki payload kısmı base64 ile encode edilmiş. İçinde { id: "1", user: "admin" } var. Bu fonksiyonlar onu çözüyor.

function base64UrlDecodetoUtf8(input: string) {
    let str = input.replace(/-/g, "+").replace(/_/g, "/"); // stringi okunabilir metne çevirir
    while (str.length % 4 !== 0) str += "="; // base64 stringin uzunluğu 4'ün katı olmalı, değilse '=' ekle

    const binary = atob(str); //  atob() fonksiyonu base64 stringi binary veriye çevirir
    try {
        const percentEncoded = binary.split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("");
        return decodeURIComponent(percentEncoded);
    } catch {
        return binary;// yedek olarak, eğer decodeURIComponent başarısız olursa, ikili dizeyi doğrudan döndürebiliriz (bu durumda UTF-8 karakterler bozulabilir).

   }
}
   // tokenı böl kullanıcı bilgisini al 

   function parseToken(token:string) : AuthUser | null{
    try{
        const payload = token.split(".") [1]; //"eyJhbG.eyJpZCI6.imza".split(".")→ ["eyJhbG", "eyJpZCI6", "imza"]→ [1] = "eyJpZCI6" (payload)
        const json = base64UrlDecodetoUtf8(payload); // "eyJpZCI6" → "{"id":"1","user":"admin"}"
        return JSON.parse(json); // "{"id":"1","user":"admin"}" → { id: "1", user: "admin" }
    }
    catch{
        return null;
    }
   }
//AuthProvider:kullanıcı oturum bilgisini tüm uygulamaya dağıtmak için
    export function AuthProvider({children} : {children : ReactNode}){ // react node: react bileşenlerini temsil eder örneğin <App /> <Login /> <Register /> <Product /> vb.
        const [token , setToken] =useState<string |null > (sessionStorage.getItem("token")) ; // useState ile geçici olarak tarayıcı hafızasındaki token alır  böylece sayfa yenilendiğinde session storage de token varsa alır yoksa null döner
    const [user, setUSer] = useState<AuthUser | null > (() =>{  // fonksiyon olarak verdiğimiz için sadece ilk renderda çalışır
        const t =sessionStorage.getItem("token"); // session storage de token var mı kontrol et
        return t ? parseToken(t) : null; // varsa tokenı parse et yoksa null döner
   })

   // login fonksiyonu
   const login = (newToken :string) =>{
    sessionStorage.setItem("token",newToken);
    setToken(newToken);
    setUSer(parseToken(newToken));//token yukarıdaki parseToken fonksiyonundan geçer ve kullanıcı bilgisi alaınır
   }

   // logout fonksiyonu

   const logout = () => {
    sessionStorage.removeItem("token");
    setToken(null);
    setUSer(null);
   }

   // veri paylaşma

   return(
    <AuthContext.Provider value={{token,user,login,logout}}>
        {children}
    </AuthContext.Provider>
   );
}

// useAuth ile kolay erişim

export function useAuth(){
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuth sadece AuthProvider içinde kullanılabilir");
    return ctx;
}




   

    

