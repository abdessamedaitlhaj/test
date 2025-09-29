
export function formatStartedSince(startedSince: Date) {
  const date = new Date(startedSince);

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${month}/${day}/${year} ${hours}:${minutes}`;
}