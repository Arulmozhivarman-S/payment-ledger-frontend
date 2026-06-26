// Money is stored as integer minor units (cents). All formatting assumes a
// 2-decimal currency, which covers USD / EUR / INR and friends.

export const groupInt = (n) =>
  String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function fmtMinor(minor) {
  const num = Number(minor) || 0;
  const neg = num < 0;
  const abs = Math.abs(num);
  const whole = Math.floor(abs / 100);
  const cents = String(abs % 100).padStart(2, "0");
  return { sign: neg ? "\u2212" : "", whole: groupInt(whole), cents };
}

export const majorToMinor = (v) => Math.round(parseFloat(v) * 100);

export function decodeJwt(t) {
  try {
    const payload = t.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export const genKey = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : "key-" + Date.now() + "-" + Math.random().toString(16).slice(2);

export const isoTime = (v) => {
  if (!v) return "\u2014";
  try {
    return new Date(v).toISOString().replace("T", " ").slice(0, 19) + "Z";
  } catch {
    return String(v);
  }
};
