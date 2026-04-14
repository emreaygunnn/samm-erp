import * as dotenv from "dotenv";

const getToken = (): String => {
  dotenv.config();
  const username = process.env.ORACLE_USERNAME;
  const password = process.env.ORACLE_PASSWORD;

  const credentials = `${username}:${password}`;
  return Buffer.from(credentials).toString("base64");
};

export default getToken;
