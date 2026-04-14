import axios from "axios";
import { oracleConfig } from "../config/config.js";
import getToken from "./getToken.js";

export const updateDescription = async (
  uniqId: string,
  itemDescription: string
) => {
  try {
    const token = getToken();
    const headers = {
      Authorization: `Basic ${token}`,
    };

    let data = {
      ItemDescription: itemDescription,
    };

    const res = await axios.patch(`${oracleConfig.item}/${uniqId}`, data, {
      headers: headers,
    });

    return true;
  } catch (err: any) {
    console.log("Error updating description:", err.message);
    return false;
  }
};
