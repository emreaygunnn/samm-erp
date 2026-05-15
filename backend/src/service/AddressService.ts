import { getAddressFull } from "../utils/getAddressFull.js";

export class AddressService {
  // Adresin tüm Oracle alanlarını döner (Check sayfası için)
  public async getAddressFull(
    partyNumber: string,
  ): Promise<any[] | "NOT_FOUND"> {
    return getAddressFull(partyNumber);
  }
}
