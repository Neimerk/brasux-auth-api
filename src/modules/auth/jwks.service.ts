const rsaPemToJwk = require("rsa-pem-to-jwk");

import { jwtPublicKey } from "../../config/jwt";

export function getJwks() {
  const jwk = rsaPemToJwk(
    jwtPublicKey,
    {
      use: "sig",
      kid: "brasux-auth-key",
    },
    "public"
  ) as Record<string, unknown>;

  return {
    keys: [jwk],
  };
}