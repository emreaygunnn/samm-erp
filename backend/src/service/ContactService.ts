import type { ContactUpdateResult } from "@shared/types/contact.ts";
import { updateContact } from "../utils/updateContact.js";
import { oracleConfig } from "../config/config.js";

// Frontend alan adı → Oracle CRM contacts API alan adı
const CONTACT_FIELDS: Record<string, string> = {
  email:        "EmailAddress",
  rawPhoneNumber:  "RawPhoneNumber",
  currencyCode: "CurrencyCode",
};

export class ContactService {
  // Tek kişi güncelle
  public async updateContact(
    partyNumber: string,
    fields: Record<string, any>,
  ): Promise<ContactUpdateResult> {
    const results: string[] = [];

    for (const [frontendField, value] of Object.entries(fields)) {
      const apiField = CONTACT_FIELDS[frontendField];

      if (!apiField) {
        results.push(`${frontendField}: Geçersiz alan`);
        continue;
      }

      // Tüm alanlar direkt PATCH /contacts/{partyNumber} ile güncellenir
      const updated = await updateContact(
        partyNumber,
        apiField,
        value,
        oracleConfig.contact,
      );

      results.push(`${frontendField}: ${updated ? "Başarılı" : "Hata"}`);
    }

    const hasErrors = results.some(
      (r) => r.includes("Hata") || r.includes("Geçersiz"),
    );
    const successCount = results.filter((r) => r.includes("Başarılı")).length;

    return {
      id: partyNumber,
      success: !hasErrors && successCount > 0,
      message: results.join(", "),
    };
  }

  // Toplu güncelleme — paralel çalışır
  public async bulkUpdate(
    items: Array<{ id: string; [key: string]: any }>,
  ): Promise<ContactUpdateResult[]> {
    const promises = items.map(async (item) => {
      const { id, ...fields } = item;
      try {
        return await this.updateContact(id, fields);
      } catch (err) {
        return { id, success: false, message: (err as Error).message };
      }
    });

    return Promise.all(promises);
  }
}