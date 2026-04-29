import dotenv from "dotenv";
dotenv.config(); // Bu satır .env dosyasını gerçekten okur ve process.env'e yazar

export const oracleConfig = {
  user: process.env.ORACLE_USERNAME,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING,
  item:     "https://ejwu-test.fa.em2.oraclecloud.com/fscmRestApi/resources/11.13.18.05/itemsV2",
  customer: "https://ejwu-test.fa.em2.oraclecloud.com/crmRestApi/resources/11.13.18.05/accounts",
};
