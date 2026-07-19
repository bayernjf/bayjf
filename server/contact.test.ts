import { describe, expect, it } from 'vitest';
import { validateContactMessage } from './contact';

describe('validateContactMessage', () => {
  it('normalizes and accepts a valid message', () => {
    const result = validateContactMessage({
      name: '  Ada Lovelace ',
      email: ' ada@example.com ',
      subject: ' Project enquiry ',
      message: ' Hello ',
    });

    expect(result).toEqual({
      success: true,
      data: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        subject: 'Project enquiry',
        message: 'Hello',
      },
    });
  });

  it('rejects missing fields and invalid email', () => {
    const result = validateContactMessage({ name: '', email: 'invalid', subject: '', message: '' });
    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.errors.email).toContain('valid email');
      expect(result.errors.name).toBeDefined();
      expect(result.errors.subject).toBeDefined();
      expect(result.errors.message).toBeDefined();
    }
  });

  it('rejects fields over their maximum length', () => {
    const result = validateContactMessage({
      name: 'a'.repeat(101),
      email: 'ada@example.com',
      subject: 'Hello',
      message: 'World',
    });
    expect(result.success).toBe(false);
    if (result.success === false) expect(result.errors.name).toContain('100');
  });
});
