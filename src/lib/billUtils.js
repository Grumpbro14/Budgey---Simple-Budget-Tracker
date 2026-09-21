// Frontend utilities for Bill Reminders display.

// Days from today until the due date (negative = overdue, 0 = today).
export function daysUntilDue(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

// Human-readable due label: "Due tomorrow", "Due in 5 days", "Overdue by 2 days", etc.
export function formatDueLabel(days) {
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

// Color-coded urgency level based on days remaining.
export function getUrgencyLevel(days) {
  if (days < 0) return "overdue";
  if (days <= 1) return "soon";
  if (days <= 7) return "upcoming";
  return "later";
}

// Map urgency level to Tailwind classes for the countdown badge.
export function urgencyBadgeClasses(level) {
  switch (level) {
    case "overdue":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "soon":
      return "bg-warning/15 text-warning-foreground border-warning/30";
    case "upcoming":
      return "bg-primary/10 text-primary border-primary/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// Format a date string (YYYY-MM-DD) as "Sep 15, 2026".
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Human-readable recurring label.
export function recurringLabel(recurring) {
  switch (recurring) {
    case "weekly": return "Weekly";
    case "monthly": return "Monthly";
    case "yearly": return "Yearly";
    default: return "One-time";
  }
}

// Human-readable reminder method label.
export function reminderMethodLabel(method) {
  switch (method) {
    case "push": return "In-app";
    case "email": return "Email";
    case "both": return "In-app + Email";
    default: return "Email";
  }
}