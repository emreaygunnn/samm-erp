import type { ProfileUpdateResult } from "@shared/types/profile.ts";
import { updateProfile } from "../utils/updateProfile.js";
import { getProfileValue } from "../utils/getProfileValue.js";

// Frontend alan adı → SOAP XML element adı
const PROFILE_FIELDS: Record<string, string> = {
  creditLimit: "CreditLimit",
};

export class ProfileService {
  // Tek profil güncelle — ContactService ile aynı yapı, REST yerine SOAP kullanır
  public async updateProfile(
    accountNumber: string,
    fields: Record<string, any>,
  ): Promise<ProfileUpdateResult> {
    const results: string[] = [];

    for (const [frontendField, value] of Object.entries(fields)) {
      const apiField = PROFILE_FIELDS[frontendField];

      if (!apiField) {
        results.push(`${frontendField}: Geçersiz alan`);
        continue;
      }

      // SOAP ile güncelle — REST'ten farklı olarak XML body ile POST atılır
      const updated = await updateProfile(accountNumber, value);
      results.push(`${frontendField}: ${updated ? "Başarılı" : "Hata"}`);
    }

    const hasErrors = results.some(
      (r) => r.includes("Hata") || r.includes("Geçersiz"),
    );
    const successCount = results.filter((r) => r.includes("Başarılı")).length;

    return {
      id: accountNumber,
      success: !hasErrors && successCount > 0,
      message: results.join(", "),
    };
  }

  // Mevcut değerleri SOAP üzerinden Oracle'dan çeker (Check butonu için)
  public async getProfileValues(
    items: Array<{ id: string }>,
    operation: string
  ): Promise<{ id: string; currentValue: string; status: "found" | "not_found" | "error" }[]> {
    const promises = items.map(async ({ id }) => {
      const result = await getProfileValue(id, operation);
      if (result === false)       return { id, currentValue: "", status: "error" as const };
      if (result === "NOT_FOUND") return { id, currentValue: "", status: "not_found" as const };
      return { id, currentValue: result, status: "found" as const };
    });
    return Promise.all(promises);
  }

  // Toplu güncelleme — paralel çalışır
  public async bulkUpdate(
    items: Array<{ id: string; [key: string]: any }>,
  ): Promise<ProfileUpdateResult[]> {
    const promises = items.map(async (item) => {
      const { id, ...fields } = item;
      try {
        return await this.updateProfile(id, fields);
      } catch (err) {
        return { id, success: false, message: (err as Error).message };
      }
    });

    return Promise.all(promises);
  }
}
