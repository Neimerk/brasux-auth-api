import fs from "node:fs";
import path from "node:path";

const privateKeyPath = path.resolve("keys/private.pem");
const publicKeyPath = path.resolve("keys/public.pem");

export const jwtPrivateKey = fs.readFileSync(privateKeyPath, "utf8");

export const jwtPublicKey = fs.readFileSync(publicKeyPath, "utf8");