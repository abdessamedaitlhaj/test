


export const timeFormat = (timestamp) => {
  const messageDate = new Date(timestamp).getTime();
  const diffMs = Date.now() - messageDate;

  if (diffMs < 60000) return "Now";

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 365) return `${diffDays}d`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y`;
};
