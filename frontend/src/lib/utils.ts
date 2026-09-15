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

/** Final selling price of a product (sale price wins over base price). */
export function productPrice(product: { base_price: number; sale_price: number | null }) {
    return product.sale_price ?? product.base_price;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipped: "Đang giao hàng",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
};

/** Human-readable Vietnamese label for an order status. */
export function orderStatusLabel(status: string): string {
    return ORDER_STATUS_LABELS[status] ?? status;
}
