import { describe, it, expect } from 'vitest';
import { formatRelativeDate } from './formatRelativeDate';

describe('formatRelativeDate', () => {
  const now = new Date('2026-02-16T12:00:00Z').getTime();

  it('should return "maintenant" for a date a few seconds ago', () => {
    const date = new Date(now - 10 * 1000).toISOString();
    expect(formatRelativeDate(date, now)).toBe('maintenant');
  });

  it('should return minutes ago for a date minutes ago', () => {
    const date = new Date(now - 5 * 60 * 1000).toISOString();
    expect(formatRelativeDate(date, now)).toMatch(/il y a 5 minutes/);
  });

  it('should return hours ago for a date hours ago', () => {
    const date = new Date(now - 3 * 3600 * 1000).toISOString();
    expect(formatRelativeDate(date, now)).toMatch(/il y a 3 heures/);
  });

  it('should return days ago for a date days ago', () => {
    const date = new Date(now - 7 * 86400 * 1000).toISOString();
    expect(formatRelativeDate(date, now)).toMatch(/il y a 7 jours/);
  });

  it('should return months ago for a date months ago', () => {
    const date = new Date(now - 60 * 86400 * 1000).toISOString();
    expect(formatRelativeDate(date, now)).toMatch(/il y a 2 mois/);
  });

  it('should return years ago for a date years ago', () => {
    const date = new Date(now - 400 * 86400 * 1000).toISOString();
    expect(formatRelativeDate(date, now)).toMatch(/an|année/i);
  });
});
