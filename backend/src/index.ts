import "dotenv/config"; //burada tekrar import edilmesinin sebebi: index.ts bağımsız çalışan ana giriş noktası, config.ts'in yüklenme sırasına güvenmemek için burada da çağrılıyor.
import cors from "cors";
import express from "express"; //gelen http isteğin URL'ini parse et, method'unu kontrol et, body'yi oku, cevap gönder
import { readFileSync } from "fs"; // soap wsdl dosyasını okumak için
import { dirname, join } from "path"; // dosya yolları ile çalışmak için
import { fileURLToPath } from "url"; // dosya yolları ile çalışmak için
import authRoutes from "./routes/AuthRoutes.js";
import productRoutes from "./routes/ProdcutRoutes.js";
import customerRoutes from "./routes/CustomerRoutes.js";
import contactRoutes from "./routes/ContactRoutes.js";
import profileRoutes from "./routes/ProfileRoutes.js";
import addressRoutes from "./routes/AdressRoutes.js";
import orderRoutes from "./routes/OrderRoutes.js";
import receiptRoutes from "./routes/ReceiptRoutes.js";

const __filename = fileURLToPath(import.meta.url); // import.meta.url ES modüllerinde mevcut olan, dosyanın URL'ini verir ve fileURLToPath ile dosya yoluna çeviririz
const __dirname = dirname(__filename); //dirname ile dosya yolunun dizin kısmını alırız

// burada wsdl dosya okuması olacak

const app = express();
app.use(cors());
app.use(express.json()); // gelen json verilerini parse etmek için -req.body deki verileri okur

// route bağlama
app.use("/auther", authRoutes);
app.use("/product", productRoutes);
app.use("/customer", customerRoutes);
app.use("/contact", contactRoutes);
app.use("/profile", profileRoutes);
app.use("/address", addressRoutes);
app.use("/order", orderRoutes);
app.use("/receipt", receiptRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
