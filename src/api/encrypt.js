// src/api/encrypt.js
// Utility to hash password using AES encryption before sending to backend
import CryptoJS from "crypto-js";

// Use the exact password for encryption as required by backend
const AES_SECRET_KEY = "MySuperSecretKey";

export function encryptPassword(password) {
  if (typeof password !== "string" || !password) return "";
  // AES encrypt the password using OpenSSL-compatible key derivation and salt
  // Output as base64 (default for CryptoJS)
  return CryptoJS.AES.encrypt(password, AES_SECRET_KEY).toString();
}
