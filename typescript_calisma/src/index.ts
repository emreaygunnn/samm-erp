import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import soap from "soap";
import { fileURLToPath } from "url";
import authRoutes from "./routes/AuthRoutes.ts";
import urunRoutes from "./routes/UrunRoutes.ts";
import { rolSoapService } from "./soap/RolSoapService.ts";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wsdlIcerik = readFileSync(
  join(__dirname, "soap", "roller.wsdl"),
  "utf-8"
);

const app = express();
app.use(cors());

// MIDDLEWARE
app.use(express.json());

// ROTALARI BAĞLA (MOUNTING ROUTES)
app.use("/auther", authRoutes); // Giriş işlemleri: http://localhost:3000/auther/login
app.use("/urunler", urunRoutes); // Ürün işlemleri: http://localhost:3000/urunler

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  // SOAP servisi sunucu ayağa kalktıktan sonra mount edilir
  soap.listen(server, "/soap/roller", rolSoapService, wsdlIcerik, () => {
    console.log(` SOAP  → http://localhost:${PORT}/soap/roller`);
    console.log(` WSDL  → http://localhost:${PORT}/soap/roller?wsdl`);
  });
  console.log("-----------------------------------------");
  console.log(` Sunucu http://localhost:${PORT} AKTİF`);
  console.log("-----------------------------------------");
});

// HATA YAKALAYICI
server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(` HATA: ${PORT} portu zaten kullanımda kanka!`);
  } else {
    console.error("Sunucu hatası:", err);
  }
});
