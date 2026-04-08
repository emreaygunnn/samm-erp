import axios from "axios";

export const api = axios.create({ baseURL: "http://localhost:3000" });

// her isteğe token eklemek için
api.interceptors.request.use((config) => {// interceptor her istekten önce çalışır
    const token = sessionStorage.getItem("token");// session storage (tarayıcıda geçici hafıza)dan tokenı al
    if (token) {
        config.headers.Authorization = `Bearer ${token}` // token varsa header a ekle
    } // config  ise ayarlar paketi - backenddeki config ile karıştırma
    return config;

}); 

//401 gelirse logine yönlendir

api.interceptors.response.use( // response = backendden gelen cevap , araya girip kontrol eder
    (response) => response, // istek başarılıysa olduğu gibi kabul et
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) { // 401 veya 403 gelirse
            sessionStorage.removeItem("token"); // tokenı sil
            window.location.href = "/login"; // logine yönlendir
        }
        return Promise.reject(error);
    }

)


