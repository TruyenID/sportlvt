export { cn } from "cn"

/** Format a number as Vietnamese Dong currency (e.g. 1.234.000₫). */
export function formatVnd(amount: number | string | null | undefined): string {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    if (value === null || value === undefined || Number.isNaN(value)) return "0₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

/** Convert a product name to a URL-friendly slug. */
export function slugify(input: string): string {
    return input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/gi, "d")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
