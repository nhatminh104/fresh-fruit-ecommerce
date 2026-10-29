export function formatDate(value) { return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value)); }
