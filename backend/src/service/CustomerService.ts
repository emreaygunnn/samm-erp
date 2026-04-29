import type { CustomerUpdateResult } from "@shared/types/customer.ts";
import { oracleConfig } from "../config/config.js";
import { updateCustomer } from "src/utils/updateCustomer.js";

// Frontend alan adı → Oracle CRM accounts API alan adı
const CUSTOMER_FIELDS: Record<string, string> = {
  currencyCode: "CurrencyCode",
  email: "EmailAddress",
  phoneNumber: "PhoneNumber",
};

export class CustomerService {
  // Tek müşteri güncelle
  public async updateCustomer(
    partyNumber: string,
    fields: Record<string, any>
  ): Promise<CustomerUpdateResult> {
    const results: string[] = [];

    for (const [frontendField, value] of Object.entries(fields)) {
      const apiField = CUSTOMER_FIELDS[frontendField];

      if (!apiField) {
        results.push(`${frontendField}: Geçersiz alan`);
        continue;
      }

      // Tüm alanlar direkt PATCH /accounts/{partyNumber} ile güncellenir
      const updated = await updateCustomer(
        partyNumber,
        apiField,
        value,
        oracleConfig.customer
      );

      results.push(`${frontendField}: ${updated ? "Başarılı" : "Hata"}`);
    }

    const hasErrors = results.some(
      (r) => r.includes("Hata") || r.includes("Geçersiz")
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
    items: Array<{ id: string; [key: string]: any }>
  ): Promise<CustomerUpdateResult[]> {
    const promises = items.map(async (item) => {
      const { id, ...fields } = item;
      try {
        return await this.updateCustomer(id, fields);
      } catch (err) {
        return { id, success: false, message: (err as Error).message };
      }
    });

    return Promise.all(promises);
  }
}
