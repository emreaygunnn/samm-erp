import express from "express";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import soap from "soap";
import urunRoutes from "./routes/UrunRoutes.ts";
import kullaniciRoutes from "./routes/KullaniciRoutes.ts";
import authRoutes from "./routes/AuthRoutes.ts";
import siparisRoutes from "./routes/SiparisRoutes.ts";
import rolRoutes from "./routes/RolRoutes.ts";
import { rolSoapService } from "./soap/RolSoapService.ts";
import cors from "cors";
import mongoose from "mongoose";
import "./models/RolModel.ts";
import { connectToOracle } from "./config/database.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wsdlIcerik = readFileSync(
  join(__dirname, "soap", "roller.wsdl"),
  "utf-8",
);

const mongoURI =
  "mongodb+srv://emreaygun:<db_password>@cluster0.wanf2b3.mongodb.net/?appName=Cluster0";

mongoose
  .connect(mongoURI.replace("<db_password>", "emre1905gs"))
  .then(() => console.log(" veritabanına BAĞLANDIK!"))
  .catch((err) => console.log(" bağlanamadık: ", err));

mongoose.connection.on("connected", () => {
  console.log(" sipariş bekliyoruz!");
});
connectToOracle()
  .then(() => console.log("Oracle'a BAĞLANDIK!"))
  .catch((err) => console.error("Oracle bağlanamadık:", err));

dotenv.config();
const app = express();
app.use(cors());

// MIDDLEWARE
app.use(express.json());

// ROTALARI BAĞLA (MOUNTING ROUTES)
app.use("/auther", authRoutes); // Giriş işlemleri: http://localhost:3000/auther/login
app.use("/urunler", urunRoutes); // Ürün işlemleri: http://localhost:3000/urunler
app.use("/kullanicilar", kullaniciRoutes); // Kullanıcı işlemleri: http://localhost:3000/kullanicilar
app.use("/siparisler", siparisRoutes);
app.use("/roller", rolRoutes);

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
