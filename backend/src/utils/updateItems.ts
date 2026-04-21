import axios from "axios";
import { oracleConfig } from "../config/config.js";
import getToken from "./getToken.js";

export const updateItem = async (
  uniqId: string,
  field: string, // dinamik alan adı (stock veya location)
  value: string | number, //
) => {
  try {
    const token = getToken();
    const headers = {
      Authorization: `Basic ${token}`,
    };

    let data = {
      [field]: value,
    };

    const res = await axios.patch(`${oracleConfig.item}/${uniqId}`, data, {
      headers: headers,
    });

    return true;
  } catch (err: any) {
    console.log(`Error updating ${field}:`, err.message);
    return false;
  }
};
