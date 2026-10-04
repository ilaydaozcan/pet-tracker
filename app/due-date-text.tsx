import { isOverdue } from "@/lib/due-dates";
import { formatDate } from "@/lib/records";

// A due date, in red with an "Overdue" label once it has passed.
export default function DueDateText({ date }: { date: string }) {
  if (!isOverdue(date)) return <span>{formatDate(date)}</span>;
  return (
    <span className="text-red-600">
      <span className="font-medium">Overdue</span> · {formatDate(date)}
    </span>
  );
}
