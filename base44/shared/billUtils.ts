// Shared backend utilities for Bill Reminders.
// Imported by manage-bill-reminders and process-bill-reminders.

// Advance a due date to the next occurrence based on the recurring schedule.
// Returns a YYYY-MM-DD date string.
export function advanceDate(dueDate: string, recurring: string): string {
  const d = new Date(dueDate + "T00:00:00Z");
  if (recurring === "weekly") {
    d.setUTCDate(d.getUTCDate() + 7);
  } else if (recurring === "monthly") {
    d.setUTCMonth(d.getUTCMonth() + 1);
  } else if (recurring === "yearly") {
    d.setUTCFullYear(d.getUTCFullYear() + 1);
  }
  return d.toISOString().split("T")[0];
}

// Compute tomorrow's date (YYYY-MM-DD) in the given IANA timezone.
export function getTomorrowInTimezone(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(now);
  const today = new Date(todayStr + "T00:00:00Z");
  today.setUTCDate(today.getUTCDate() + 1);
  return today.toISOString().split("T")[0];
}

// Compute today's date (YYYY-MM-DD) in the given IANA timezone.
export function getTodayInTimezone(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}