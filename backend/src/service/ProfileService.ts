import type { ProfileUpdateResult } from "@shared/types/profile.ts";
import { updateProfile } from "../utils/updateProfile.js";

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
