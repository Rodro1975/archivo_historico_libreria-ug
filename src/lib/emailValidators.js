// src/lib/emailValidators.js
export const EMAIL_REGEX_STRICT = /^[^\s@]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;

export const ALLOWED_TLDS = new Set([
  "com",
  "net",
  "org",
  "info",
  "biz",
  "edu",
  "gov",
  "mil",
  "io",
  "ai",
  "app",
  "dev",
  "gg",
  "co",
  "us",
  "uk",
  "ca",
  "mx",
  "ar",
  "cl",
  "br",
  "pe",
  "uy",
  "py",
  "bo",
  "do",
  "gt",
  "sv",
  "hn",
  "ni",
  "cr",
  "pa",
  "pr",
  "es",
  "fr",
  "de",
  "it",
  "nl",
  "se",
  "no",
  "fi",
  "dk",
  "ch",
  "at",
  "be",
  "pl",
  "pt",
  "cz",
  "sk",
  "hu",
  "ro",
  "bg",
  "gr",
  "tr",
  "il",
  "in",
  "id",
  "jp",
  "kr",
  "cn",
  "hk",
  "tw",
  "sg",
  "my",
  "ph",
  "th",
  "vn",
  "au",
  "nz",
  "za",
  "ru",
  "ua",
  "kz",
  "sa",
  "ae",
  "qa",
  "bh",
  "kw",
  "eg",
  "ma",
  "tn",
  "ng",
  "ke",
]);

export function isAllowedDomain(domain = "") {
  const labels = (domain || "").toLowerCase().split(".");
  if (labels.length < 2) return false; // requiere SLD + TLD
  const tld = labels.at(-1);
  const sld = labels.at(-2);

  if (!ALLOWED_TLDS.has(tld)) return false; // TLD permitido
  const labelOk = (l) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(l);
  if (!labels.every(labelOk)) return false;
  if (!/[a-z]/.test(sld)) return false; // SLD debe tener al menos una letra
  return true;
}

export function validateEmailByInstitution(tipo, email) {
  const correo = (email || "").trim().toLowerCase();
  if (!EMAIL_REGEX_STRICT.test(correo)) return "Email inválido.";
  const domain = correo.split("@")[1] || "";
  if (!isAllowedDomain(domain)) return "Dominio de correo inválido.";

  if (tipo === "UG" && !correo.endsWith("@ugto.mx")) {
    return "Para UG el correo debe ser @ugto.mx.";
  }
  return null; // ok
}
