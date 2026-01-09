const publicPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyVL1E7FToJ8Jhb3OupaI
a7LTBn7S8LlhK2hhpcal10AYPodkhPaRmWUYTXLh1/xXOhXWQJ/wgrOCdmvxWWd+
ivibKYYGxwI/8cKnsUHlsc/1QJJ2A4/NVa/69wT6x+IfIOTqTjJp1TuFmQI1+pK/
wm+MbPxb678qlC0fYADpzb51RE9jRjlwPdHCne2musdM326LqsqESOFvaRpYUX9r
CZSHeV2VTK1nSlfB9mNXuADwYmQ0b63q/GDT6s9HK+1ezxgBodzcQYrSroeg2Bhr
Nf58X8VgeeM+jP6wDJZyT+u/1jvZmz4RhchkUv5MV6zhC2zwXwz1Y8RVzzRfgvb5
AQIDAQAB
-----END PUBLIC KEY-----
`;
export const EncryptFlow = async (data: string) => {
  const keyData = Uint8Array.from(
    atob(publicPem.replace(/-----(BEGIN|END) PUBLIC KEY-----|\s/g, "")),
    (c) => c.charCodeAt(0)
  );

  const publicKey = await crypto.subtle.importKey(
    "spki",
    keyData,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  // AES-256 uchun 32 byte random key yaratish
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );

  // IV (Initialization Vector) yaratish - AES-GCM uchun 12 byte
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Datani AES-GCM bilan shifrlash
  const encodedData = new TextEncoder().encode(data);
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    encodedData
  );

  // AES keyni eksport qilish va RSA-OAEP bilan shifrlash
  const exportedKey = await crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    exportedKey
  );

  // Barcha ma'lumotlarni base64 formatiga o'tkazish
  const encryptedKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encryptedKey))
  );
  const encryptedDataBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encryptedData))
  );
  const ivBase64 = btoa(String.fromCharCode(...iv));

  // Backendga jo'natish uchun formatlash
  return JSON.stringify({
    encryptedKey: encryptedKeyBase64,
    encryptedData: encryptedDataBase64,
    iv: ivBase64,
  });
};
