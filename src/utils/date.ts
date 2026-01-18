import { format } from "date-fns";

export function formatDate(date: Date | string, formatStr: string) {
  return format(new Date(date), formatStr);
}
