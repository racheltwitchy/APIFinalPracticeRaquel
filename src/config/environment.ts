import { merge } from "lodash";
import { development } from "./development";
import { test } from "./test";

const all = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "defaultsecret",
};

export const config = merge(all, _getEnvironmentConfig());

function _getEnvironmentConfig() {
  if (process.env.NODE_ENV === "development") {
    return development;
  } else if (process.env.NODE_ENV === "test") {
    return test;
  } else {
    return development;
  }
}
