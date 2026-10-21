import dayjs from "dayjs";

export function formatDate(value?: string | Date | null): string {
  if (!value) return "-";
  const date = dayjs(value);
  return date.isValid() ? date.format("MMM D, YYYY") : "-";
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "-";
  const date = dayjs(value);
  return date.isValid() ? date.format("MMM D, YYYY h:mm A") : "-";
}
