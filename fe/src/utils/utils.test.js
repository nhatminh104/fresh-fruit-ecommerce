import { describe, expect, it } from 'vitest';
import { formatCurrency } from './formatCurrency';
import { formatDate } from './formatDate';
import { isEmail, isRequired } from './validators';
import { getErrorMessage } from './errorMessage';

describe('formatCurrency', () => {
  it('formats VND amounts', () => {
    expect(formatCurrency(150000)).toContain('150');
    expect(formatCurrency(0)).toContain('0');
    expect(formatCurrency()).toContain('0');
  });
});

describe('formatDate', () => {
  it('formats ISO dates in Vietnamese locale', () => {
    expect(formatDate('2026-01-15T00:00:00.000Z')).toBeTruthy();
  });
});

describe('validators', () => {
  it('validates required values', () => {
    expect(isRequired('  abc ')).toBe(true);
    expect(isRequired('   ')).toBe(false);
    expect(isRequired(null)).toBe(false);
  });

  it('validates emails', () => {
    expect(isEmail('user@example.com')).toBe(true);
    expect(isEmail('not-an-email')).toBe(false);
    expect(isEmail('a@b')).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('prefers the API message and falls back gracefully', () => {
    expect(getErrorMessage({ response: { data: { message: 'Email đã được đăng ký' } } })).toBe(
      'Email đã được đăng ký'
    );
    expect(getErrorMessage(new Error('Network Error'))).toBe('Network Error');
    expect(getErrorMessage(null, 'Lỗi dự phòng')).toBe('Lỗi dự phòng');
  });
});
