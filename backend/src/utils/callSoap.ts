import axios from "axios";
import getToken from "./getToken.js";

// Genel SOAP POST utility — REST'teki axios.patch/get muadili
// Her SOAP operasyonu için aynı HTTP yapısı: POST + SOAPAction header + XML body
export const callSoap = async (
  url: string,
  action: string, // SOAPAction header değeri (örn. "findCustomerProfile")
  body: string,   // tam SOAP envelope XML string
): Promise<string> => {
  const token = getToken();

  const res = await axios.post(url, body, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "SOAPAction": action,
      "Authorization": `Basic ${token}`,
    },
    timeout: 15000,
  });

  return String(res.data);
};