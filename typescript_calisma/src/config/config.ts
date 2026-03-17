import dotenv from "dotenv";
dotenv.config();

export const oracleConfig = {
  user: process.env.ORACLE_USER!,
  password: process.env.ORACLE_PASSWORD!,
  connectString: process.env.ORACLE_CONNECT_STRING!,
};
