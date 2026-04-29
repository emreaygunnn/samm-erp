import axios from "axios";
import { oracleConfig } from "../config/config.js";
import getToken from "./getToken.js";

export const getItem = async (
  key: string,
  value: string,
  key2: string,
  value2: string
) => {
  try {
    const token = getToken();
    const headers = {
      Authorization: `Basic ${token}`,
    };
    const res = await axios.get(
      `${oracleConfig.item}?q=${key}=${value};${key2}=${value2}`,
      {
        headers: headers,
      }
    );
    if (res.data.items.length === 0) {
      console.log(`${key}=${value} not found in Oracle`);
      return false;
    }

    const selfLink = res.data.items[0].links.find(
      // .links ile her ürün obajesi içerisine array koyar
      (link: any) => link.rel === "self"
    ).href;

    const urlParts = selfLink.split("/");
    const uniqId = urlParts[urlParts.length - 1];

    return uniqId;
  } catch (err: any) {
    return false;
  }
};
