export const isRequired = (value) => String(value ?? '').trim().length > 0;
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
