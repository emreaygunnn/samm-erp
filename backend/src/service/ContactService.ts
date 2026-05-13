import type { ContactUpdateResult } from "@shared/types/contact.ts";
import { updateContact } from "../utils/updateContact.js";
import { getContactValue } from "../utils/getContactValue.js";
import { getContactFull } from "../utils/getContactFull.js";
import { oracleConfig } from "../config/config.js";

// Frontend alan adı → Oracle CRM contacts API alan adı
const CONTACT_FIELDS: Record<string, string> = {
  email: "EmailAddress",
  rawPhoneNumber: "RawPhoneNumber",
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

  // Mevcut değerleri Oracle'dan çeker (Check butonu için)
  public async getContactValues(
    items: Array<{ id: string }>,
    operation: string,
  ): Promise<
    {
      id: string;
      currentValue: string;
      status: "found" | "not_found" | "error";
    }[]
  > {
    const promises = items.map(async ({ id }) => {
      const result = await getContactValue(id, operation);
      if (result === false)
        return { id, currentValue: "", status: "error" as const };
      if (result === "NOT_FOUND")
        return { id, currentValue: "", status: "not_found" as const };
      return { id, currentValue: result, status: "found" as const };
    });
    return Promise.all(promises);
  }

  // Kişinin tüm Oracle alanlarını döner (Check sayfası için)
  public async getContactFull(
    partyNumber: string
  ): Promise<Record<string, any> | "NOT_FOUND"> {
    return getContactFull(partyNumber);
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
