import { getReceiptFull } from "../utils/getReceiptFull.js";

export class ReceiptService {
  async getReceiptFull(receiptNumber: string): Promise<Record<string, any> | "NOT_FOUND"> {
    return getReceiptFull(receiptNumber);
  }
}
