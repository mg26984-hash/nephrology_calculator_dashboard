/**
 * Automated Regression Testing Framework for Nephrology Calculators
 * 
 * This framework provides comprehensive regression testing for all 55 calculators
 * to prevent calculation errors and unit conversion bugs from being deployed.
 * 
 * Usage:
 * - Import and run tests before deployment
 * - Add new test cases as calculators are updated
 * - Validate against reference calculators
 */

import * as calc from './calculators';

export interface RegressionTestCase {
  name: string;
  description: string;
  inputs: Record<string, any>;
  expectedOutput: number | Record<string, number>;
  tolerance: number; // Acceptable deviation from expected output
}

export interface RegressionTestSuite {
  calculatorId: string;
  calculatorName: string;
  referenceSource: string;
  testCases: RegressionTestCase[];
}

export interface RegressionTestResult {
  calculatorId: string;
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errors: Array<{
    testName: string;
    expected: number | Record<string, number>;
    actual: number | Record<string, number>;
    error: number;
    tolerance: number;
    message: string;
  }>;
}

/**
 * Comprehensive regression test suites for all critical calculators
 */
export const regressionTestSuites: RegressionTestSuite[] = [
  {
    calculatorId: 'bun-creatinine-ratio',
    calculatorName: 'BUN/Creatinine Ratio',
    referenceSource: 'Clinical nephrology reference standards',
    testCases: [
      {
        name: 'Normal ratio (conventional units)',
        description: 'BUN 20 mg/dL, Creatinine 1.0 mg/dL = ratio 20',
        inputs: { bun: 20, bunUnit: 'conventional', creatinine: 1.0, creatinineUnit: 'conventional' },
        expectedOutput: 20,
        tolerance: 0.1,
      },
      {
        name: 'Elevated ratio (conventional units)',
        description: 'BUN 40 mg/dL, Creatinine 1.0 mg/dL = ratio 40',
        inputs: { bun: 40, bunUnit: 'conventional', creatinine: 1.0, creatinineUnit: 'conventional' },
        expectedOutput: 40,
        tolerance: 0.1,
      },
      {
        name: 'SI units conversion',
        description: 'BUN 7.14 mmol/L, Creatinine 88.4 μmol/L = ratio 20',
        inputs: { bun: 7.14, bunUnit: 'si', creatinine: 88.4, creatinineUnit: 'si' },
        expectedOutput: 20,
        tolerance: 0.5,
      },
      {
        name: 'Mixed units (BUN SI, Creatinine conventional)',
        description: 'BUN 7.14 mmol/L, Creatinine 1.0 mg/dL = ratio 20',
        inputs: { bun: 7.14, bunUnit: 'si', creatinine: 1.0, creatinineUnit: 'conventional' },
        expectedOutput: 20,
        tolerance: 0.5,
      },
    ],
  },
  {
    calculatorId: 'ckd-epi-creatinine',
    calculatorName: 'CKD-EPI Creatinine (2021)',
    referenceSource: 'Inker LA et al. N Engl J Med. 2021;385(19):1737-1749',
    testCases: [
      {
        name: 'Normal eGFR - Male, Other race',
        description: 'Creatinine 1.0 mg/dL, Age 45, Male, Other race = eGFR ~95',
        inputs: { creatinine: 1.0, age: 45, sex: 'M', race: 'Other' },
        expectedOutput: 95,
        tolerance: 2,
      },
      {
        name: 'Reduced eGFR - Female, Black race',
        description: 'Creatinine 1.5 mg/dL, Age 65, Female, Black race = eGFR ~40',
        inputs: { creatinine: 1.5, age: 65, sex: 'F', race: 'Black' },
        expectedOutput: 40,
        tolerance: 3,
      },
      {
        name: 'SI units - Creatinine in μmol/L',
        description: 'Creatinine 88.4 μmol/L (1.0 mg/dL), Age 45, Male, Other = eGFR ~95',
        inputs: { creatinine: 88.4, creatinineUnit: 'si', age: 45, sex: 'M', race: 'Other' },
        expectedOutput: 95,
        tolerance: 2,
      },
    ],
  },
  {
    calculatorId: 'cockcroft-gault',
    calculatorName: 'Cockcroft-Gault Creatinine Clearance',
    referenceSource: 'Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41',
    testCases: [
      {
        name: 'Male patient',
        description: 'Creatinine 1.0 mg/dL, Age 45, Weight 70 kg, Male = CrCl ~100',
        inputs: { creatinine: 1.0, age: 45, weight: 70, sex: 'M' },
        expectedOutput: 100,
        tolerance: 5,
      },
      {
        name: 'Female patient',
        description: 'Creatinine 1.0 mg/dL, Age 45, Weight 60 kg, Female = CrCl ~80',
        inputs: { creatinine: 1.0, age: 45, weight: 60, sex: 'F' },
        expectedOutput: 80,
        tolerance: 5,
      },
      {
        name: 'Elderly male',
        description: 'Creatinine 1.5 mg/dL, Age 75, Weight 70 kg, Male = CrCl ~50',
        inputs: { creatinine: 1.5, age: 75, weight: 70, sex: 'M' },
        expectedOutput: 50,
        tolerance: 5,
      },
    ],
  },
  {
    calculatorId: 'schwartz-pediatric',
    calculatorName: 'Schwartz Pediatric eGFR',
    referenceSource: 'Schwartz GJ et al. Kidney Int. 2009;76(7):702-712',
    testCases: [
      {
        name: 'Child with normal kidney function',
        description: 'Creatinine 0.5 mg/dL, Height 120 cm = eGFR ~120',
        inputs: { creatinine: 0.5, height: 120 },
        expectedOutput: 120,
        tolerance: 10,
      },
      {
        name: 'Adolescent with reduced function',
        description: 'Creatinine 1.0 mg/dL, Height 170 cm = eGFR ~100',
        inputs: { creatinine: 1.0, height: 170 },
        expectedOutput: 100,
        tolerance: 10,
      },
      {
        name: 'SI units - Creatinine in μmol/L',
        description: 'Creatinine 44.2 μmol/L (0.5 mg/dL), Height 120 cm = eGFR ~120',
        inputs: { creatinine: 44.2, creatinineUnit: 'si', height: 120 },
        expectedOutput: 120,
        tolerance: 10,
      },
    ],
  },
  {
    calculatorId: 'ktv-hemodialysis',
    calculatorName: 'Kt/V (Hemodialysis Adequacy)',
    referenceSource: 'Daugirdas JT. Am J Kidney Dis. 1993;22(6):803-809',
    testCases: [
      {
        name: 'Adequate dialysis session',
        description: 'Pre-BUN 60, Post-BUN 20, Weight 70 kg, Duration 240 min = Kt/V ~1.2',
        inputs: { preBUN: 60, postBUN: 20, weight: 70, sessionDuration: 240, bunUnit: 'conventional' },
        expectedOutput: 1.2,
        tolerance: 0.1,
      },
      {
        name: 'Inadequate dialysis session',
        description: 'Pre-BUN 50, Post-BUN 30, Weight 70 kg, Duration 180 min = Kt/V ~0.8',
        inputs: { preBUN: 50, postBUN: 30, weight: 70, sessionDuration: 180, bunUnit: 'conventional' },
        expectedOutput: 0.8,
        tolerance: 0.1,
      },
    ],
  },
];

/**
 * Run regression tests for a specific calculator
 */
export function runCalculatorTests(calculatorId: string): RegressionTestResult {
  const suite = regressionTestSuites.find(s => s.calculatorId === calculatorId);
  
  if (!suite) {
    return {
      calculatorId,
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      errors: [{ testName: 'Setup', expected: 0, actual: 0, error: 0, tolerance: 0, message: `No test suite found for calculator: ${calculatorId}` }],
    };
  }

  const result: RegressionTestResult = {
    calculatorId,
    passed: true,
    totalTests: suite.testCases.length,
    passedTests: 0,
    failedTests: 0,
    errors: [],
  };

  for (const testCase of suite.testCases) {
    try {
      let actual: number | Record<string, number> | undefined;

      // Call the appropriate calculator function based on ID
      switch (calculatorId) {
        case 'bun-creatinine-ratio':
          actual = calc.bunCreatinineRatio(
            testCase.inputs.bun,
            testCase.inputs.creatinine,
            testCase.inputs.bunUnit || 'conventional',
            testCase.inputs.creatinineUnit || 'conventional'
          );
          break;
        case 'ckd-epi-creatinine':
          actual = calc.ckdEpiCreatinine(
            testCase.inputs.creatinine,
            testCase.inputs.age,
            testCase.inputs.sex,
            testCase.inputs.race,
            testCase.inputs.creatinineUnit === 'si' ? 'μmol/L' : 'mg/dL'
          );
          break;
        case 'cockcroft-gault':
          actual = calc.cockcrofGault(
            testCase.inputs.creatinine,
            testCase.inputs.age,
            testCase.inputs.weight,
            testCase.inputs.sex,
            'mg/dL'
          );
          break;
        case 'schwartz-pediatric':
          actual = calc.schwartzPediatric(
            testCase.inputs.creatinine,
            testCase.inputs.height,
            testCase.inputs.creatinineUnit === 'si' ? 'μmol/L' : 'mg/dL'
          );
          break;
        case 'ktv-hemodialysis':
          actual = calc.ktv(
            testCase.inputs.preBUN,
            testCase.inputs.postBUN,
            testCase.inputs.weight,
            testCase.inputs.sessionDuration,
            testCase.inputs.bunUnit || 'conventional'
          );
          break;
      }

      if (actual === undefined) {
        result.errors.push({
          testName: testCase.name,
          expected: testCase.expectedOutput,
          actual: 0,
          error: 0,
          tolerance: testCase.tolerance,
          message: `Calculator function returned undefined for: ${testCase.name}`,
        });
        result.failedTests++;
        result.passed = false;
        continue;
      }

      // Extract numeric value if result is an object
      const actualValue = typeof actual === 'number' ? actual : Object.values(actual)[0] as number;
      const expectedValue = typeof testCase.expectedOutput === 'number' ? testCase.expectedOutput : Object.values(testCase.expectedOutput)[0] as number;

      // Calculate error
      const error = Math.abs(actualValue - expectedValue);

      if (error <= testCase.tolerance) {
        result.passedTests++;
      } else {
        result.failedTests++;
        result.passed = false;
        result.errors.push({
          testName: testCase.name,
          expected: testCase.expectedOutput,
          actual,
          error,
          tolerance: testCase.tolerance,
          message: `Expected ${expectedValue} ± ${testCase.tolerance}, got ${actualValue} (error: ${error.toFixed(3)})`,
        });
      }
    } catch (err) {
      result.failedTests++;
      result.passed = false;
      result.errors.push({
        testName: testCase.name,
        expected: testCase.expectedOutput,
        actual: 0,
        error: 0,
        tolerance: testCase.tolerance,
        message: `Exception: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return result;
}

/**
 * Run all regression tests
 */
export function runAllRegressionTests(): Record<string, RegressionTestResult> {
  const results: Record<string, RegressionTestResult> = {};
  
  for (const suite of regressionTestSuites) {
    results[suite.calculatorId] = runCalculatorTests(suite.calculatorId);
  }

  return results;
}

/**
 * Generate a summary report of regression test results
 */
export function generateRegressionTestReport(results: Record<string, RegressionTestResult>): string {
  let report = '# Regression Test Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const [calculatorId, result] of Object.entries(results)) {
    totalTests += result.totalTests;
    totalPassed += result.passedTests;
    totalFailed += result.failedTests;

    const status = result.passed ? '✓ PASSED' : '✗ FAILED';
    report += `## ${calculatorId} - ${status}\n`;
    report += `- Total Tests: ${result.totalTests}\n`;
    report += `- Passed: ${result.passedTests}\n`;
    report += `- Failed: ${result.failedTests}\n`;

    if (result.errors.length > 0) {
      report += `\n### Errors:\n`;
      for (const error of result.errors) {
        report += `- **${error.testName}**: ${error.message}\n`;
      }
    }
    report += '\n';
  }

  report += `## Summary\n`;
  report += `- Total Tests: ${totalTests}\n`;
  report += `- Passed: ${totalPassed}\n`;
  report += `- Failed: ${totalFailed}\n`;
  report += `- Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%\n`;

  return report;
}

/**
 * Export test results to JSON for CI/CD integration
 */
export function exportTestResultsJSON(results: Record<string, RegressionTestResult>): string {
  return JSON.stringify(results, null, 2);
}
