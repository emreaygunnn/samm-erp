import { XMLParser } from "fast-xml-parser";

// Oracle BI Publisher runReport SOAP cevabından base64 rapor verisini çözer
// Giriş: SOAP XML string (axios'tan gelen res.data)
// Çıkış: satır dizisi (her eleman bir rapor satırı) veya undefined
export const base64 = async (soapXml: string): Promise<any[] | undefined> => {
  try {
    // 1. SOAP zarfını parse et, reportBytes'ı al
    const soapParser = new XMLParser({ ignoreAttributes: true, removeNSPrefix: true });
    const soap = soapParser.parse(soapXml);

    const body = soap?.Envelope?.Body;
    const response = body?.runReportResponse;
    const reportBytes = response?.reportBytes;

    if (!reportBytes) return undefined;

    // 2. Base64 çöz → XML string
    const xmlString = Buffer.from(String(reportBytes), "base64").toString("utf-8");

    // 3. Rapor XML'ini parse et (isArray:true → xml2js benzeri davranış)
    const dataParser = new XMLParser({ ignoreAttributes: true, isArray: () => true });
    const parsed = dataParser.parse(xmlString);

    // 4. İlk veri dizisini bul ve döndür
    for (const rootKey of Object.keys(parsed)) {
      const root = parsed[rootKey];
      if (Array.isArray(root)) return root;
      if (typeof root === "object" && root !== null) {
        for (const childKey of Object.keys(root)) {
          if (Array.isArray(root[childKey])) return root[childKey];
        }
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
};
