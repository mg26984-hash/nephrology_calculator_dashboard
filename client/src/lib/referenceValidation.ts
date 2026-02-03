/**
 * Reference Validation Test Framework
 * 
 * This module provides a standardized way to validate calculator results
 * against known reference values from validated medical calculators.
 * 
 * CRITICAL: Every calculator MUST have reference test cases defined here.
 * Tests are run before deployment to catch formula errors early.
 */

// ============================================================================
// TEST CASE INTERFACE
// ============================================================================

export interface ReferenceTestCase {
  name: string;
  description?: string;
  inputs: Record<string, number | string>;
  expectedOutput: number | Record<string, number | string>;
  tolerance?: number; // Default: 0.1 (±0.1)
  source?: string; // Reference calculator URL or publication
}

export interface CalculatorTestSuite {
  calculatorId: string;
  calculatorName: string;
  testCases: ReferenceTestCase[];
  referenceSource?: string;
}

export interface TestResult {
  testCase: ReferenceTestCase;
  actualOutput: number | Record<string, number | string>;
  passed: boolean;
  error?: number; // Absolute difference
  percentError?: number; // Percentage difference
}

// ============================================================================
// TEST SUITES FOR ALL CALCULATORS
// ============================================================================

export const REFERENCE_TEST_SUITES: Record<string, CalculatorTestSuite> = {
  "bun-creatinine-ratio": {
    calculatorId: "bun-creatinine-ratio",
    calculatorName: "BUN/Creatinine Ratio",
    referenceSource: "Clinical Nephrology Standards",
    testCases: [
      {
        name: "Conventional Units - Normal",
        description: "Normal BUN and creatinine values",
        inputs: { bunValue: 14, creatinine: 1.0, inputType: "bun", bunUnit: "mg/dL", creatinineUnit: "mg/dL" },
        expectedOutput: 14,
        tolerance: 0.1,
      },
      {
        name: "Conventional Units - Elevated",
        description: "Elevated ratio suggesting prerenal azotemia",
        inputs: { bunValue: 28, creatinine: 0.9, inputType: "bun", bunUnit: "mg/dL", creatinineUnit: "mg/dL" },
        expectedOutput: 31.1,
        tolerance: 0.1,
      },
      {
        name: "SI Units - Elevated",
        description: "SI units equivalent to conventional elevated case",
        inputs: { bunValue: 9.94, creatinine: 79.56, inputType: "bun", bunUnit: "mmol/L", creatinineUnit: "μmol/L" },
        expectedOutput: 30.9,
        tolerance: 0.2,
      },
      {
        name: "Mixed Units",
        description: "BUN in conventional, creatinine in SI",
        inputs: { bunValue: 28, creatinine: 79.56, inputType: "bun", bunUnit: "mg/dL", creatinineUnit: "μmol/L" },
        expectedOutput: 31.1,
        tolerance: 0.1,
      },
      {
        name: "Urea Input - Conventional",
        description: "Using urea input instead of BUN",
        inputs: { bunValue: 60, creatinine: 1.0, inputType: "urea", bunUnit: "mg/dL", creatinineUnit: "mg/dL" },
        expectedOutput: 28,
        tolerance: 0.5,
      },
    ],
  },

  "ckd-epi-creatinine": {
    calculatorId: "ckd-epi-creatinine",
    calculatorName: "CKD-EPI Creatinine (2021)",
    referenceSource: "Inker LA et al. N Engl J Med. 2021;385(19):1737-1749",
    testCases: [
      {
        name: "Normal GFR - Male",
        description: "45-year-old male with normal creatinine",
        inputs: { creatinine: 1.0, age: 45, sex: "M", race: "Other", creatinineUnit: "mg/dL" },
        expectedOutput: 90,
        tolerance: 5,
      },
      {
        name: "CKD Stage 3a - Female",
        description: "60-year-old female with mild-moderate CKD",
        inputs: { creatinine: 1.5, age: 60, sex: "F", race: "Other", creatinineUnit: "mg/dL" },
        expectedOutput: 45,
        tolerance: 5,
      },
      {
        name: "SI Units - Normal",
        description: "Normal GFR using SI units",
        inputs: { creatinine: 88.4, age: 45, sex: "M", race: "Other", creatinineUnit: "μmol/L" },
        expectedOutput: 90,
        tolerance: 5,
      },
    ],
  },

  "cockcroft-gault": {
    calculatorId: "cockcroft-gault",
    calculatorName: "Cockcroft-Gault Creatinine Clearance",
    referenceSource: "Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41",
    testCases: [
      {
        name: "Standard Male",
        description: "50-year-old male, 70kg",
        inputs: { creatinine: 1.0, age: 50, weight: 70, sex: "M", creatinineUnit: "mg/dL" },
        expectedOutput: 84,
        tolerance: 2,
      },
      {
        name: "Standard Female",
        description: "50-year-old female, 65kg",
        inputs: { creatinine: 1.0, age: 50, weight: 65, sex: "F", creatinineUnit: "mg/dL" },
        expectedOutput: 72,
        tolerance: 2,
      },
    ],
  },

  "bmi": {
    calculatorId: "bmi",
    calculatorName: "Body Mass Index (BMI)",
    referenceSource: "WHO BMI Classification",
    testCases: [
      {
        name: "Normal BMI",
        description: "Height 170cm, Weight 70kg",
        inputs: { height: 170, weight: 70, heightUnit: "cm", weightUnit: "kg" },
        expectedOutput: 24.2,
        tolerance: 0.1,
      },
      {
        name: "Obese BMI",
        description: "Height 5'10\", Weight 250lbs",
        inputs: { height: 5.83, weight: 250, heightUnit: "ft", weightUnit: "lbs" },
        expectedOutput: 35.8,
        tolerance: 0.2,
      },
    ],
  },

  "corrected-calcium": {
    calculatorId: "corrected-calcium",
    calculatorName: "Corrected Calcium for Albumin",
    referenceSource: "Clinical Chemistry Standards",
    testCases: [
      {
        name: "Low Albumin - Correction Needed",
        description: "Serum calcium 8.0 mg/dL, albumin 2.5 g/dL",
        inputs: { serumCalcium: 8.0, albumin: 2.5 },
        expectedOutput: 9.0,
        tolerance: 0.2,
      },
      {
        name: "Normal Albumin - No Correction",
        description: "Serum calcium 9.0 mg/dL, albumin 4.0 g/dL",
        inputs: { serumCalcium: 9.0, albumin: 4.0 },
        expectedOutput: 9.0,
        tolerance: 0.1,
      },
    ],
  },

  "anion-gap": {
    calculatorId: "anion-gap",
    calculatorName: "Serum Anion Gap",
    referenceSource: "Clinical Chemistry Standards",
    testCases: [
      {
        name: "Normal Anion Gap",
        description: "Na 140, K 4, Cl 102, HCO3 24",
        inputs: { sodium: 140, potassium: 4, chloride: 102, bicarbonate: 24 },
        expectedOutput: 18,
        tolerance: 1,
      },
      {
        name: "Elevated Anion Gap",
        description: "Na 140, K 5, Cl 95, HCO3 15",
        inputs: { sodium: 140, potassium: 5, chloride: 95, bicarbonate: 15 },
        expectedOutput: 35,
        tolerance: 1,
      },
    ],
  },

  "fena": {
    calculatorId: "fena",
    calculatorName: "Fractional Excretion of Sodium (FENa)",
    referenceSource: "Clinical Nephrology Standards",
    testCases: [
      {
        name: "Prerenal Azotemia",
        description: "FENa < 1% suggesting prerenal cause",
        inputs: { serumSodium: 140, serumCreatinine: 2.0, urineSodium: 20, urineCreatinine: 100 },
        expectedOutput: 0.7,
        tolerance: 0.1,
      },
      {
        name: "Intrinsic Renal Disease",
        description: "FENa > 2% suggesting intrinsic renal disease",
        inputs: { serumSodium: 140, serumCreatinine: 2.0, urineSodium: 100, urineCreatinine: 100 },
        expectedOutput: 3.5,
        tolerance: 0.2,
      },
    ],
  },

  "osmolal-gap": {
    calculatorId: "osmolal-gap",
    calculatorName: "Serum Osmolal Gap",
    referenceSource: "Clinical Chemistry Standards",
    testCases: [
      {
        name: "Normal Osmolal Gap",
        description: "Normal electrolytes and glucose",
        inputs: { sodium: 140, glucose: 100, bun: 20, alcoholLevel: 0 },
        expectedOutput: 10,
        tolerance: 5,
      },
      {
        name: "Elevated Gap - Possible Toxin",
        description: "Elevated gap suggesting unmeasured osmoles",
        inputs: { sodium: 140, glucose: 100, bun: 20, alcoholLevel: 0 },
        expectedOutput: 20,
        tolerance: 5,
      },
    ],
  },

  "water-deficit-hypernatremia": {
    calculatorId: "water-deficit-hypernatremia",
    calculatorName: "Water Deficit in Hypernatremia",
    referenceSource: "Clinical Nephrology Standards",
    testCases: [
      {
        name: "Mild Hypernatremia",
        description: "70kg patient, Na 155 mEq/L",
        inputs: { weight: 70, currentSodium: 155, targetSodium: 140, sex: "M" },
        expectedOutput: 3.5,
        tolerance: 0.5,
      },
    ],
  },

  "sodium-deficit-hyponatremia": {
    calculatorId: "sodium-deficit",
    calculatorName: "Sodium Deficit in Hyponatremia",
    referenceSource: "Clinical Nephrology Standards",
    testCases: [
      {
        name: "Moderate Hyponatremia",
        description: "70kg patient, Na 120 mEq/L",
        inputs: { weight: 70, currentSodium: 120, targetSodium: 130, sex: "M" },
        expectedOutput: 70,
        tolerance: 10,
      },
    ],
  },

  "ktv-hemodialysis": {
    calculatorId: "ktv-hemodialysis",
    calculatorName: "Kt/V (Hemodialysis Adequacy)",
    referenceSource: "KDIGO 2015 - Daugirdas Second Generation Formula",
    testCases: [
      {
        name: "Conventional Units - Adequate",
        description: "Pre-BUN 60, Post-BUN 20, Weight 70kg, Session 240min",
        inputs: { preBUN: 60, postBUN: 20, postWeight: 70, sessionTime: 240, ultrafiltration: 0, bunUnit: "mg/dL" },
        expectedOutput: 1.2,
        tolerance: 0.15,
      },
      {
        name: "SI Units - Adequate",
        description: "Pre-BUN 21.4 mmol/L, Post-BUN 7.1 mmol/L",
        inputs: { preBUN: 21.4, postBUN: 7.1, postWeight: 70, sessionTime: 240, ultrafiltration: 0, bunUnit: "mmol/L" },
        expectedOutput: 1.2,
        tolerance: 0.15,
      },
    ],
  },
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a single test case
 * 
 * @param testCase - Test case to validate
 * @param actualOutput - Actual output from calculator
 * @returns TestResult with pass/fail status
 */
export function validateTestCase(
  testCase: ReferenceTestCase,
  actualOutput: number | Record<string, number | string>
): TestResult {
  const tolerance = testCase.tolerance || 0.1;
  
  // Handle numeric outputs
  if (typeof testCase.expectedOutput === "number" && typeof actualOutput === "number") {
    const error = Math.abs(actualOutput - testCase.expectedOutput);
    const percentError = (error / testCase.expectedOutput) * 100;
    const passed = error <= tolerance;
    
    return {
      testCase,
      actualOutput,
      passed,
      error,
      percentError,
    };
  }
  
  // Handle object outputs
  if (typeof testCase.expectedOutput === "object" && typeof actualOutput === "object") {
    // Compare all numeric fields
    let allPassed = true;
    let maxError = 0;
    
    for (const [key, expectedValue] of Object.entries(testCase.expectedOutput)) {
      if (typeof expectedValue === "number" && typeof actualOutput[key] === "number") {
        const error = Math.abs(actualOutput[key] - expectedValue);
        maxError = Math.max(maxError, error);
        if (error > tolerance) {
          allPassed = false;
        }
      }
    }
    
    return {
      testCase,
      actualOutput,
      passed: allPassed,
      error: maxError,
    };
  }
  
  return {
    testCase,
    actualOutput,
    passed: false,
    error: undefined,
  };
}

/**
 * Run all test cases for a calculator
 * 
 * @param calculatorId - ID of calculator to test
 * @param calculationFunction - Function that performs the calculation
 * @returns Array of test results
 */
export function runCalculatorTests(
  calculatorId: string,
  calculationFunction: (inputs: Record<string, unknown>) => number | Record<string, number | string>
): TestResult[] {
  const testSuite = REFERENCE_TEST_SUITES[calculatorId];
  if (!testSuite) {
    console.warn(`No test suite found for calculator: ${calculatorId}`);
    return [];
  }
  
  const results: TestResult[] = [];
  
  for (const testCase of testSuite.testCases) {
    try {
      const actualOutput = calculationFunction(testCase.inputs);
      const result = validateTestCase(testCase, actualOutput);
      results.push(result);
    } catch (error) {
      results.push({
        testCase,
        actualOutput: 0,
        passed: false,
        error: undefined,
      });
    }
  }
  
  return results;
}

/**
 * Generate a test report
 * 
 * @param calculatorId - ID of calculator
 * @param results - Array of test results
 * @returns Formatted report
 */
export function generateTestReport(
  calculatorId: string,
  results: TestResult[]
): string {
  const testSuite = REFERENCE_TEST_SUITES[calculatorId];
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const passRate = total > 0 ? (passed / total) * 100 : 0;
  
  let report = `\n${'='.repeat(80)}\n`;
  report += `TEST REPORT: ${testSuite?.calculatorName || calculatorId}\n`;
  report += `${'='.repeat(80)}\n`;
  report += `Pass Rate: ${passed}/${total} (${passRate.toFixed(1)}%)\n`;
  report += `Reference: ${testSuite?.referenceSource || "Unknown"}\n\n`;
  
  for (const result of results) {
    const status = result.passed ? "✓ PASS" : "✗ FAIL";
    report += `${status}: ${result.testCase.name}\n`;
    
    if (!result.passed) {
      report += `  Expected: ${result.testCase.expectedOutput}\n`;
      report += `  Actual:   ${result.actualOutput}\n`;
      if (result.error !== undefined) {
        report += `  Error:    ${result.error.toFixed(3)} (${result.percentError?.toFixed(1)}%)\n`;
      }
    }
    
    if (result.testCase.description) {
      report += `  Note:     ${result.testCase.description}\n`;
    }
    report += "\n";
  }
  
  return report;
}

/**
 * Validate all calculators
 * 
 * @param calculationFunctions - Map of calculator IDs to calculation functions
 * @returns Summary report
 */
export function validateAllCalculators(
  calculationFunctions: Record<string, (inputs: Record<string, unknown>) => number | Record<string, number | string>>
): string {
  let summary = "\n" + "=".repeat(80) + "\n";
  summary += "COMPREHENSIVE CALCULATOR VALIDATION REPORT\n";
  summary += "=".repeat(80) + "\n\n";
  
  let totalTests = 0;
  let totalPassed = 0;
  const failedCalculators: string[] = [];
  
  for (const [calculatorId, testSuite] of Object.entries(REFERENCE_TEST_SUITES)) {
    const calcFunction = calculationFunctions[calculatorId];
    if (!calcFunction) {
      console.warn(`No calculation function provided for: ${calculatorId}`);
      continue;
    }
    
    const results = runCalculatorTests(calculatorId, calcFunction);
    const passed = results.filter(r => r.passed).length;
    totalTests += results.length;
    totalPassed += passed;
    
    if (passed < results.length) {
      failedCalculators.push(calculatorId);
    }
    
    summary += generateTestReport(calculatorId, results);
  }
  
  summary += "\n" + "=".repeat(80) + "\n";
  summary += `OVERALL RESULTS\n`;
  summary += `${'='.repeat(80)}\n`;
  summary += `Total Tests: ${totalTests}\n`;
  summary += `Passed: ${totalPassed}\n`;
  summary += `Failed: ${totalTests - totalPassed}\n`;
  summary += `Pass Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%\n`;
  
  if (failedCalculators.length > 0) {
    summary += `\nFailed Calculators:\n`;
    for (const calcId of failedCalculators) {
      summary += `  - ${calcId}\n`;
    }
  }
  
  return summary;
}

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export default {
  REFERENCE_TEST_SUITES,
  validateTestCase,
  runCalculatorTests,
  generateTestReport,
  validateAllCalculators,
};
