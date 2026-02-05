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
  const labels = input.options.map(o => o.label.toLowerCase());
  
  // Check for yes/no values
  if (values.includes('yes') && values.includes('no')) return true;
  
  // Check for 0/1 values with Yes/No labels
  if ((values.includes('0') && values.includes('1')) && 
      (labels.includes('yes') && labels.includes('no'))) return true;
  
  return false;
}

/**
 * Get the label for a Yes/No option
 */
export function getYesNoLabel(input: CalculatorInput, value: 'yes' | 'no'): string {
  if (!input.options) return value === 'yes' ? 'Yes' : 'No';
  
  // For 0/1 values, find by label
  const yesOption = input.options.find(o => o.label.toLowerCase() === 'yes');
  const noOption = input.options.find(o => o.label.toLowerCase() === 'no');
  
  if (value === 'yes') {
    return yesOption?.label || 'Yes';
  } else {
    return noOption?.label || 'No';
  }
}

/**
 * Get the actual value for Yes/No toggle based on input options
 * Some inputs use "yes"/"no", others use "0"/"1"
 */
export function getYesNoValue(input: CalculatorInput, isYes: boolean): string {
  if (!input.options) return isYes ? 'yes' : 'no';
  
  const yesOption = input.options.find(o => o.label.toLowerCase() === 'yes');
  const noOption = input.options.find(o => o.label.toLowerCase() === 'no');
  
  if (isYes) {
    return yesOption?.value || 'yes';
  } else {
    return noOption?.value || 'no';
  }
}

/**
 * Check if the current value represents "Yes" for this input
 */
export function isYesValue(input: CalculatorInput, value: string | undefined): boolean {
  if (!value) return false;
  if (!input.options) return value.toLowerCase() === 'yes';
  
  const yesOption = input.options.find(o => o.label.toLowerCase() === 'yes');
  return yesOption?.value === value || value.toLowerCase() === 'yes';
}
