import { useState, useEffect } from 'react';

/**
 * Delays updating a value until a specified period of inactivity has passed.
 * Useful for limiting API calls triggered by rapid user input (e.g. search fields).
 *
 * The returned value only updates once the caller stops changing {@link value}
 * for at least {@link delay} milliseconds. Each new change resets the timer.
 *
 * @param value - The raw value to debounce.
 * @param delay - The debounce delay in milliseconds.
 * @returns The debounced value.
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * // debouncedSearch updates 300 ms after the user stops typing.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
