/**
 * Date formatting utilities.
 *
 * Format rules:
 *  - Same minute          → "Just now"
 *  - Same day             → "HH:mm" (e.g. "14:35")
 *  - This week (< 7 days) → "Mon", "Tue", etc.
 *  - This year            → "Mar 5"
 *  - Older                → "Mar 5, 2024"
 */

import {
    format,
    isToday,
    isYesterday,
    differenceInMinutes,
    isThisWeek,
    isThisYear,
} from "date-fns";

export function formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();

    if (differenceInMinutes(now, date) < 1) return "Just now";
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    if (isThisWeek(date)) return format(date, "EEE");           // e.g. "Mon"
    if (isThisYear(date)) return format(date, "MMM d");         // e.g. "Mar 5"
    return format(date, "MMM d, yyyy");                         // e.g. "Mar 5, 2024"
}

export function formatLastSeen(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const minutesAgo = differenceInMinutes(now, date);

    if (minutesAgo < 2) return "Just now";
    if (minutesAgo < 60) return `${minutesAgo}m ago`;

    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;

    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
}

export function formatConversationTime(timestamp: number): string {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    if (isThisWeek(date)) return format(date, "EEE");
    return format(date, "MMM d");
}
