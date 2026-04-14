// Payment utility functions for client-side

/**
 * Check payment status for a session
 */
export async function checkPaymentStatus(sessionId: string) {
  try {
    const response = await fetch(`/api/payments/status/${sessionId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Payment] Failed to check status:", error);
    return { success: false, error: "Failed to check payment status" };
  }
}

/**
 * Request a refund for a session
 */
export async function requestRefund(sessionId: string, reason?: string) {
  try {
    const response = await fetch("/api/payments/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, reason }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Payment] Failed to request refund:", error);
    return { success: false, error: "Failed to request refund" };
  }
}

/**
 * Retry a failed payment
 */
export async function retryPayment(sessionId: string, amount: number) {
  try {
    // 1. Create new order
    const orderResponse = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, amount, currency: "INR" }),
    });

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      throw new Error(orderData.message || "Failed to create order");
    }

    return { success: true, data: orderData.data };
  } catch (error: any) {
    console.error("[Payment] Failed to retry:", error);
    return { success: false, error: error.message || "Failed to retry payment" };
  }
}

/**
 * Check if payment is refundable based on status
 */
export function isRefundable(paymentStatus: string, sessionStatus: string): boolean {
  return (
    paymentStatus === "completed" &&
    sessionStatus !== "completed" &&
    sessionStatus !== "cancelled"
  );
}

/**
 * Format amount from paise to rupees
 */
export function formatAmount(amountInPaise: number): string {
  return `₹${(amountInPaise / 100).toFixed(2)}`;
}

/**
 * Payment status labels for UI
 */
export const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-yellow-600" },
  completed: { label: "Paid", color: "text-green-600" },
  failed: { label: "Failed", color: "text-red-600" },
  refunded: { label: "Refunded", color: "text-blue-600" },
  not_initiated: { label: "Not Paid", color: "text-slate-500" },
};
