export function varibulNameValidator(value: string) {
  // string o'zgaruvchi ochish qoidalariga zid yoki zid emasligini belgilaydi
  // misol uchun:
  // salom olam = false
  // salom_olam = true

  const isValid = /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
  return value && isValid;
}
