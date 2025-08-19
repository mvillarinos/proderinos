// Color
export function getStatusColor(
  status: string
):
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral" {
  const colors: Record<
    string,
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral"
  > = {
    pending: "warning",
    draft: "neutral",
    in_progress: "info",
    completed: "success",
    cancelled: "error",
  };
  return colors[status] || "neutral";
}

// Dates
export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
}
