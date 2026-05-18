import { getSalesOrderFull } from "../utils/getSalesOrderFull.js";

export class OrderService {
  async getOrderFull(orderHeaderId: string): Promise<Record<string, any> | "NOT_FOUND"> {
    return getSalesOrderFull(orderHeaderId);
  }
}
