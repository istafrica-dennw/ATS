import { format, formatDistance, formatRelative } from "date-fns";

export const formatDate = (
  date: string | Date,
  formatStr: string = "MMM d, yyyy"
): string => {
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export const formatTimeAgo = (date: string | Date): string => {
  try {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting time ago:", error);
    return "";
  }
};

export const formatRelativeDate = (date: string | Date): string => {
  try {
    return formatRelative(new Date(date), new Date());
  } catch (error) {
    console.error("Error formatting relative date:", error);
    return "";
  }
};

export const formatCurrency = (
  amount: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};
