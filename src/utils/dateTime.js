export const APP_TIME_ZONE = "Asia/Karachi";

const hasTimeZone = (value) => /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);

export const parseBackendDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const rawValue = String(value).trim();
  if (!rawValue) return null;

  const normalizedValue = rawValue.includes("T")
    ? rawValue
    : rawValue.replace(" ", "T");
  const dateValue = hasTimeZone(normalizedValue)
    ? normalizedValue
    : `${normalizedValue}Z`;
  const parsed = new Date(dateValue);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toTimestamp = (value) => {
  const parsed = parseBackendDate(value);
  return parsed ? parsed.getTime() : 0;
};

export const formatDateTime = (value, fallback = "-") => {
  const parsed = parseBackendDate(value);
  if (!parsed) return fallback;

  return parsed.toLocaleString("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
};

export const formatDate = (value, fallback = "-") => {
  const parsed = parseBackendDate(value);
  if (!parsed) return fallback;

  return parsed.toLocaleDateString("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export const formatTimeAgo = (value) => {
  const timestamp = toTimestamp(value);
  if (!timestamp) return "Just now";

  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day ago`;

  return formatDate(value);
};
