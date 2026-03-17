import oracledb from "oracledb";
import { oracleConfig } from "./config.ts";

// Oracle veritabanına bağlanmak için gerekli olan modülü içe aktar
let pool: oracledb.Pool;

export async function connectToOracle() {
  pool = await oracledb.createPool({
    user: oracleConfig.user,
    password: oracleConfig.password,
    connectString: oracleConfig.connectString,
  });
  console.log("Oracle bağlantı havuzu oluşturuldu.");
}

export async function getConnection() {
  return await pool.getConnection();
}
