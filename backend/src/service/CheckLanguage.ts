import axios from "axios";
import * as dotenv from "dotenv";
import { oracleConfig } from "../config/config.js";
import getToken from "../utils/getToken.js";
dotenv.config();

import { base64 } from "../utils/base64.js";

export const checkLanguage = async () => {
  const url = oracleConfig.report;
  const token = getToken();
  const headers = {
    headers: {
      "Content-Type": "text/xml;charset=UTF-8",
      Authorization: `Basic ${token}`,
    },
  };
  const payload = createPayload();

  try {
    console.log("Language rapordan kontrol ediliyor.");

    const res = await axios.post(url, payload, headers);

    const decodedData = await base64(res.data);

    if (decodedData === undefined) return false;

    const language = decodedData[0].ACTIVE_USER_LANGUAGE[0];
    console.log("Language raporda bulundu.");
    return language;
  } catch (err: any) {
    console.log(err.response.data);
    console.log("\tCheck language rapordan sorgulanamadı.");
    return false;
  }
};

function createPayload(): string {
  return `
    <soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:pub='http://xmlns.oracle.com/oxp/service/PublicReportService'>
        <soapenv:Header/>   
        <soapenv:Body>
            <pub:runReport>
                <pub:reportRequest>
                    <pub:reportAbsolutePath>/Custom/SAMM Entgrsyn/Active_User_Language.xdo</pub:reportAbsolutePath>
                </pub:reportRequest>
                <pub:userID>${process.env.ORACLE_USERNAME}</pub:userID>
                <pub:password>${process.env.ORACLE_PASSWORD}</pub:password>
            </pub:runReport>
        </soapenv:Body>
    </soapenv:Envelope>`;
}
