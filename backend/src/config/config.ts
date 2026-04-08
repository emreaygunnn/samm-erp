import dotenv from "dotenv";
dotenv.config(); // Bu satır .env dosyasını gerçekten okur ve process.env'e yazar

export const oracleConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
}   