/**
 * Helper functions for input type detection
 */

import { CalculatorInput } from './calculatorData';

/**
 * Check if a select input is a binary Yes/No toggle
 * Returns true if the input has exactly 2 options with "yes" and "no" values
 */
export function isBinaryYesNoInput(input: CalculatorInput): boolean {
  if (input.type !== 'select' || !input.options) return false;
  if (input.options.length !== 2) return false;
  
  const values = input.options.map(o => o.value.toLowerCase());
  return values.includes('yes') && values.includes('no');
}

/**
 * Get the label for a Yes/No option
 */
export function getYesNoLabel(input: CalculatorInput, value: 'yes' | 'no'): string {
  if (!input.options) return value === 'yes' ? 'Yes' : 'No';
  const option = input.options.find(o => o.value.toLowerCase() === value);
  return option?.label || (value === 'yes' ? 'Yes' : 'No');
}
