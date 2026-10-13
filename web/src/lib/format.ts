export const fmtUsd = (n: number) => `US$ ${Math.round(n).toLocaleString("es-AR")}`;
export const fmtArs = (n: number) => `$ ${Math.round(n).toLocaleString("es-AR")}`;

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function phoneTitle(p: { model: string; storageGb: number; color: string }) {
  return `${p.model} ${p.storageGb} GB · ${p.color}`;
}
