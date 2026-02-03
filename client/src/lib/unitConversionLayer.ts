/**
 * Standardized Unit Conversion Layer
 * 
 * This module provides a unified interface for converting between UI unit flags
 * ("si"/"conventional") and canonical unit strings ("mg/dL", "mmol/L", etc.)
 * 
 * CRITICAL: All calculators MUST use this layer to convert units before calling
 * calculation functions. This ensures consistency and prevents unit conversion bugs.
 */

// ============================================================================
// CANONICAL UNIT DEFINITIONS
// ============================================================================

export const CANONICAL_UNITS = {
  // Kidney Function
  CREATININE_MG_DL: "mg/dL",
  CREATININE_UMOL_L: "μmol/L",
  BUN_MG_DL: "mg/dL",
  BUN_MMOL_L: "mmol/L",
  UREA_MG_DL: "mg/dL",
  UREA_MMOL_L: "mmol/L",
  
  // Electrolytes
  SODIUM_MEQ_L: "mEq/L",
  SODIUM_MMOL_L: "mmol/L",
  POTASSIUM_MEQ_L: "mEq/L",
  POTASSIUM_MMOL_L: "mmol/L",
  CHLORIDE_MEQ_L: "mEq/L",
  CHLORIDE_MMOL_L: "mmol/L",
  BICARBONATE_MEQ_L: "mEq/L",
  BICARBONATE_MMOL_L: "mmol/L",
  
  // Minerals
  CALCIUM_MG_DL: "mg/dL",
  CALCIUM_MMOL_L: "mmol/L",
  PHOSPHATE_MG_DL: "mg/dL",
  PHOSPHATE_MMOL_L: "mmol/L",
  
  // Other
  GLUCOSE_MG_DL: "mg/dL",
  GLUCOSE_MMOL_L: "mmol/L",
  ALBUMIN_G_DL: "g/dL",
  ALBUMIN_G_L: "g/L",
} as const;

// ============================================================================
// CONVERSION FACTORS
// ============================================================================

export const CONVERSION_FACTORS = {
  // Creatinine: mg/dL ↔ μmol/L
  creatinine: {
    factor: 88.4,
    from_mg_dl_to_umol_l: (value: number) => value * 88.4,
    from_umol_l_to_mg_dl: (value: number) => value / 88.4,
  },
  
  // BUN: mg/dL ↔ mmol/L
  bun: {
    factor: 0.357,
    from_mg_dl_to_mmol_l: (value: number) => value * 0.357,
    from_mmol_l_to_mg_dl: (value: number) => value / 0.357,
  },
  
  // Urea: mg/dL ↔ mmol/L
  urea: {
    factor: 0.166,
    from_mg_dl_to_mmol_l: (value: number) => value * 0.166,
    from_mmol_l_to_mg_dl: (value: number) => value / 0.166,
  },
  
  // Urea to BUN conversion (BUN = Urea × 0.467)
  urea_to_bun: {
    factor: 0.467,
    from_urea_to_bun: (value: number) => value * 0.467,
    from_bun_to_urea: (value: number) => value / 0.467,
  },
  
  // Sodium: mEq/L ↔ mmol/L (1:1)
  sodium: {
    factor: 1,
    from_meq_l_to_mmol_l: (value: number) => value,
    from_mmol_l_to_meq_l: (value: number) => value,
  },
  
  // Potassium: mEq/L ↔ mmol/L (1:1)
  potassium: {
    factor: 1,
    from_meq_l_to_mmol_l: (value: number) => value,
    from_mmol_l_to_meq_l: (value: number) => value,
  },
  
  // Calcium: mg/dL ↔ mmol/L
  calcium: {
    factor: 0.2495,
    from_mg_dl_to_mmol_l: (value: number) => value * 0.2495,
    from_mmol_l_to_mg_dl: (value: number) => value / 0.2495,
  },
  
  // Phosphate: mg/dL ↔ mmol/L
  phosphate: {
    factor: 0.323,
    from_mg_dl_to_mmol_l: (value: number) => value * 0.323,
    from_mmol_l_to_mg_dl: (value: number) => value / 0.323,
  },
  
  // Glucose: mg/dL ↔ mmol/L
  glucose: {
    factor: 0.0555,
    from_mg_dl_to_mmol_l: (value: number) => value * 0.0555,
    from_mmol_l_to_mg_dl: (value: number) => value / 0.0555,
  },
  
  // Albumin: g/dL ↔ g/L
  albumin: {
    factor: 10,
    from_g_dl_to_g_l: (value: number) => value * 10,
    from_g_l_to_g_dl: (value: number) => value / 10,
  },
} as const;

// ============================================================================
// UNIT CONVERSION INTERFACE
// ============================================================================

export interface UnitConversionMap {
  [key: string]: "conventional" | "si";
}

export interface CanonicalUnitMap {
  [key: string]: string;
}

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert UI unit flag to canonical unit string
 * 
 * @param fieldName - Name of the field (e.g., "creatinine", "bun", "sodium")
 * @param uiUnitFlag - UI unit flag ("conventional" or "si")
 * @returns Canonical unit string (e.g., "mg/dL", "μmol/L")
 * 
 * @example
 * const unit = convertUIFlagToCanonicalUnit("creatinine", "si");
 * // Returns: "μmol/L"
 */
export function convertUIFlagToCanonicalUnit(
  fieldName: string,
  uiUnitFlag: "conventional" | "si"
): string {
  const unitMap: Record<string, Record<string, string>> = {
    creatinine: {
      conventional: CANONICAL_UNITS.CREATININE_MG_DL,
      si: CANONICAL_UNITS.CREATININE_UMOL_L,
    },
    bun: {
      conventional: CANONICAL_UNITS.BUN_MG_DL,
      si: CANONICAL_UNITS.BUN_MMOL_L,
    },
    bunValue: {
      conventional: CANONICAL_UNITS.BUN_MG_DL,
      si: CANONICAL_UNITS.BUN_MMOL_L,
    },
    urea: {
      conventional: CANONICAL_UNITS.UREA_MG_DL,
      si: CANONICAL_UNITS.UREA_MMOL_L,
    },
    urineUrea: {
      conventional: CANONICAL_UNITS.UREA_MG_DL,
      si: CANONICAL_UNITS.UREA_MMOL_L,
    },
    sodium: {
      conventional: CANONICAL_UNITS.SODIUM_MEQ_L,
      si: CANONICAL_UNITS.SODIUM_MMOL_L,
    },
    potassium: {
      conventional: CANONICAL_UNITS.POTASSIUM_MEQ_L,
      si: CANONICAL_UNITS.POTASSIUM_MMOL_L,
    },
    calcium: {
      conventional: CANONICAL_UNITS.CALCIUM_MG_DL,
      si: CANONICAL_UNITS.CALCIUM_MMOL_L,
    },
    phosphate: {
      conventional: CANONICAL_UNITS.PHOSPHATE_MG_DL,
      si: CANONICAL_UNITS.PHOSPHATE_MMOL_L,
    },
    glucose: {
      conventional: CANONICAL_UNITS.GLUCOSE_MG_DL,
      si: CANONICAL_UNITS.GLUCOSE_MMOL_L,
    },
  };
  
  if (!unitMap[fieldName]) {
    console.warn(`No unit mapping found for field: ${fieldName}`);
    return "";
  }
  
  return unitMap[fieldName][uiUnitFlag] || "";
}

/**
 * Convert all UI unit flags in a state object to canonical unit strings
 * 
 * @param unitState - Object with UI unit flags
 * @param fieldNames - List of field names to convert
 * @returns Object with canonical unit strings
 * 
 * @example
 * const canonicalUnits = convertUIFlagsToCanonicalUnits(
 *   { creatinine: "si", bun: "conventional" },
 *   ["creatinine", "bun"]
 * );
 * // Returns: { creatinine: "μmol/L", bun: "mg/dL" }
 */
export function convertUIFlagsToCanonicalUnits(
  unitState: UnitConversionMap,
  fieldNames: string[]
): CanonicalUnitMap {
  const result: CanonicalUnitMap = {};
  
  for (const fieldName of fieldNames) {
    const uiFlag = unitState[fieldName] as "conventional" | "si" | undefined;
    if (uiFlag) {
      result[fieldName] = convertUIFlagToCanonicalUnit(fieldName, uiFlag);
    }
  }
  
  return result;
}

/**
 * Convert a value from one unit to another
 * 
 * @param value - Numeric value to convert
 * @param fromUnit - Source unit (canonical string)
 * @param toUnit - Target unit (canonical string)
 * @returns Converted value
 * 
 * @example
 * const creatinineMgDl = convertValue(79.56, "μmol/L", "mg/dL");
 * // Returns: 0.9
 */
export function convertValue(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  // If units are the same, no conversion needed
  if (fromUnit === toUnit) {
    return value;
  }
  
  // Creatinine conversions
  if (
    (fromUnit === CANONICAL_UNITS.CREATININE_MG_DL && toUnit === CANONICAL_UNITS.CREATININE_UMOL_L) ||
    (fromUnit === "mg/dL" && toUnit === "μmol/L" && value < 50)
  ) {
    return CONVERSION_FACTORS.creatinine.from_mg_dl_to_umol_l(value);
  }
  if (
    (fromUnit === CANONICAL_UNITS.CREATININE_UMOL_L && toUnit === CANONICAL_UNITS.CREATININE_MG_DL) ||
    (fromUnit === "μmol/L" && toUnit === "mg/dL")
  ) {
    return CONVERSION_FACTORS.creatinine.from_umol_l_to_mg_dl(value);
  }
  
  // BUN conversions
  if (
    (fromUnit === CANONICAL_UNITS.BUN_MG_DL && toUnit === CANONICAL_UNITS.BUN_MMOL_L) ||
    (fromUnit === "mg/dL" && toUnit === "mmol/L" && value < 100)
  ) {
    return CONVERSION_FACTORS.bun.from_mg_dl_to_mmol_l(value);
  }
  if (
    (fromUnit === CANONICAL_UNITS.BUN_MMOL_L && toUnit === CANONICAL_UNITS.BUN_MG_DL) ||
    (fromUnit === "mmol/L" && toUnit === "mg/dL" && value < 30)
  ) {
    return CONVERSION_FACTORS.bun.from_mmol_l_to_mg_dl(value);
  }
  
  // Urea conversions
  if (
    (fromUnit === CANONICAL_UNITS.UREA_MG_DL && toUnit === CANONICAL_UNITS.UREA_MMOL_L) ||
    (fromUnit === "mg/dL" && toUnit === "mmol/L" && value < 100)
  ) {
    return CONVERSION_FACTORS.urea.from_mg_dl_to_mmol_l(value);
  }
  if (
    (fromUnit === CANONICAL_UNITS.UREA_MMOL_L && toUnit === CANONICAL_UNITS.UREA_MG_DL) ||
    (fromUnit === "mmol/L" && toUnit === "mg/dL" && value < 30)
  ) {
    return CONVERSION_FACTORS.urea.from_mmol_l_to_mg_dl(value);
  }
  
  // Calcium conversions
  if (
    (fromUnit === CANONICAL_UNITS.CALCIUM_MG_DL && toUnit === CANONICAL_UNITS.CALCIUM_MMOL_L) ||
    (fromUnit === "mg/dL" && toUnit === "mmol/L" && value < 20)
  ) {
    return CONVERSION_FACTORS.calcium.from_mg_dl_to_mmol_l(value);
  }
  if (
    (fromUnit === CANONICAL_UNITS.CALCIUM_MMOL_L && toUnit === CANONICAL_UNITS.CALCIUM_MG_DL) ||
    (fromUnit === "mmol/L" && toUnit === "mg/dL")
  ) {
    return CONVERSION_FACTORS.calcium.from_mmol_l_to_mg_dl(value);
  }
  
  // Phosphate conversions
  if (
    (fromUnit === CANONICAL_UNITS.PHOSPHATE_MG_DL && toUnit === CANONICAL_UNITS.PHOSPHATE_MMOL_L) ||
    (fromUnit === "mg/dL" && toUnit === "mmol/L" && value < 20)
  ) {
    return CONVERSION_FACTORS.phosphate.from_mg_dl_to_mmol_l(value);
  }
  if (
    (fromUnit === CANONICAL_UNITS.PHOSPHATE_MMOL_L && toUnit === CANONICAL_UNITS.PHOSPHATE_MG_DL) ||
    (fromUnit === "mmol/L" && toUnit === "mg/dL")
  ) {
    return CONVERSION_FACTORS.phosphate.from_mmol_l_to_mg_dl(value);
  }
  
  // Glucose conversions
  if (
    (fromUnit === CANONICAL_UNITS.GLUCOSE_MG_DL && toUnit === CANONICAL_UNITS.GLUCOSE_MMOL_L) ||
    (fromUnit === "mg/dL" && toUnit === "mmol/L" && value < 500)
  ) {
    return CONVERSION_FACTORS.glucose.from_mg_dl_to_mmol_l(value);
  }
  if (
    (fromUnit === CANONICAL_UNITS.GLUCOSE_MMOL_L && toUnit === CANONICAL_UNITS.GLUCOSE_MG_DL) ||
    (fromUnit === "mmol/L" && toUnit === "mg/dL")
  ) {
    return CONVERSION_FACTORS.glucose.from_mmol_l_to_mg_dl(value);
  }
  
  console.warn(`No conversion found from ${fromUnit} to ${toUnit}`);
  return value;
}

/**
 * Ensure all input values are in canonical units (mg/dL for conventional, SI for SI)
 * 
 * @param inputs - Object with input values and their units
 * @returns Object with all values converted to canonical units
 * 
 * @example
 * const normalizedInputs = normalizeInputs({
 *   creatinine: { value: 79.56, unit: "μmol/L" },
 *   bun: { value: 9.94, unit: "mmol/L" }
 * });
 * // Returns: { creatinine: 0.9, bun: 27.8 }
 */
export function normalizeInputs(
  inputs: Record<string, { value: number; unit: string }>
): Record<string, number> {
  const result: Record<string, number> = {};
  
  for (const [key, { value, unit }] of Object.entries(inputs)) {
    // Determine target unit based on input unit
    let targetUnit: string;
    
    if (unit === "mg/dL" || unit === "mEq/L" || unit === "g/dL") {
      // Already conventional, keep as is
      result[key] = value;
    } else if (unit === "μmol/L") {
      // Convert creatinine to mg/dL
      result[key] = convertValue(value, unit, "mg/dL");
    } else if (unit === "mmol/L") {
      // Determine if this is BUN, urea, or other
      if (key.includes("bun")) {
        result[key] = convertValue(value, unit, "mg/dL");
      } else if (key.includes("urea")) {
        result[key] = convertValue(value, unit, "mg/dL");
      } else {
        // Keep as mmol/L for electrolytes
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Validate that unit parameters are canonical unit strings
 * 
 * @param units - Object with unit parameters
 * @returns true if all units are valid canonical strings
 */
export function validateCanonicalUnits(
  units: Record<string, string>
): boolean {
  const validUnits = new Set(Object.values(CANONICAL_UNITS));
  
  for (const [key, unit] of Object.entries(units)) {
    if (!validUnits.has(unit)) {
      console.warn(`Invalid canonical unit for ${key}: ${unit}`);
      return false;
    }
  }
  
  return true;
}

// ============================================================================
// USAGE PATTERN FOR CALCULATORS
// ============================================================================

/**
 * RECOMMENDED PATTERN FOR ALL CALCULATORS:
 * 
 * // In Dashboard.tsx, before calling calculation function:
 * 
 * const bunUnitParam = convertUIFlagToCanonicalUnit("bunValue", unitState.bunValue);
 * const creatinineUnitParam = convertUIFlagToCanonicalUnit("creatinine", unitState.creatinine);
 * 
 * const result = calc.bunCreatinineRatio(
 *   calculatorState.bunValue,
 *   calculatorState.creatinine,
 *   calculatorState.inputType,
 *   bunUnitParam,           // ← CANONICAL UNIT STRING
 *   creatinineUnitParam,    // ← CANONICAL UNIT STRING
 *   convertUIFlagToCanonicalUnit("urineUrea", unitState.urineUrea)
 * );
 * 
 * // In calculation function:
 * 
 * export function bunCreatinineRatio(
 *   bunValue: number,
 *   creatinineValue: number,
 *   inputType: "bun" | "urea",
 *   bunUnit: string,        // ← CANONICAL UNIT STRING
 *   creatinineUnit: string, // ← CANONICAL UNIT STRING
 *   ureaUnit: string        // ← CANONICAL UNIT STRING
 * ): BUNCrRatioResult {
 *   // Convert to standard units (mg/dL)
 *   const bunInMgDl = convertValue(bunValue, bunUnit, "mg/dL");
 *   const creatinineInMgDl = convertValue(creatinineValue, creatinineUnit, "mg/dL");
 *   
 *   // Perform calculation
 *   const ratio = bunInMgDl / creatinineInMgDl;
 *   
 *   return { ratio, ... };
 * }
 */

// ============================================================================
// BUN-UREA AUTO-CONVERTER
// ============================================================================

/**
 * Convert BUN value to standard mg/dL format, supporting both BUN and Urea inputs
 * 
 * This function implements the conversion logic from BUN/Creatinine Ratio calculator
 * to allow all BUN-using calculators to accept both BUN and Urea inputs.
 * 
 * Conversion Rules:
 * - BUN (mg/dL) × 0.357 = Urea (mmol/L)
 * - BUN (mmol/L) / 0.357 = BUN (mg/dL)
 * - Urea (mg/dL) × 0.467 = BUN (mg/dL)
 * - Urea (mmol/L) / 0.357 = Urea (mg/dL), then × 0.467 = BUN (mg/dL)
 * 
 * @param inputValue - The numeric value entered by user
 * @param inputType - Type of input: "bun" or "urea"
 * @param inputUnit - Unit of the input: "mg/dL", "mmol/L"
 * @returns BUN value in mg/dL (standard format for calculations)
 * 
 * @example
 * // User enters 28 mg/dL BUN
 * const bunMgDl = convertToBUNmgDl(28, "bun", "mg/dL");
 * // Returns: 28
 * 
 * @example
 * // User enters 9.94 mmol/L BUN
 * const bunMgDl = convertToBUNmgDl(9.94, "bun", "mmol/L");
 * // Returns: 27.8 (approximately)
 * 
 * @example
 * // User enters 60 mg/dL Urea
 * const bunMgDl = convertToBUNmgDl(60, "urea", "mg/dL");
 * // Returns: 28.02 (60 × 0.467)
 * 
 * @example
 * // User enters 10 mmol/L Urea
 * const bunMgDl = convertToBUNmgDl(10, "urea", "mmol/L");
 * // First: 10 / 0.357 = 28.01 mg/dL (urea)
 * // Then: 28.01 × 0.467 = 13.08 mg/dL (BUN)
 */
export function convertToBUNmgDl(
  inputValue: number,
  inputType: "bun" | "urea",
  inputUnit: "mg/dL" | "mmol/L"
): number {
  let bunMgDl = 0;

  if (inputType === "bun") {
    // BUN input - convert if needed
    if (inputUnit === "mmol/L") {
      // BUN (mmol/L) / 0.357 = BUN (mg/dL)
      bunMgDl = inputValue / 0.357;
    } else {
      // Already in mg/dL
      bunMgDl = inputValue;
    }
  } else if (inputType === "urea") {
    // Urea input - convert to BUN in mg/dL
    if (inputUnit === "mg/dL") {
      // Urea (mg/dL) × 0.467 = BUN (mg/dL)
      bunMgDl = inputValue * 0.467;
    } else {
      // inputUnit === "mmol/L"
      // First convert mmol/L to mg/dL: Urea (mmol/L) / 0.357 = Urea (mg/dL)
      // Then convert urea to BUN: Urea (mg/dL) × 0.467 = BUN (mg/dL)
      const ureaMgDl = inputValue / 0.357;
      bunMgDl = ureaMgDl * 0.467;
    }
  }

  return bunMgDl;
}

/**
 * Convert BUN value in mg/dL to Urea in mmol/L for display purposes
 * 
 * @param bunMgDl - BUN value in mg/dL
 * @returns Urea value in mmol/L
 * 
 * @example
 * const ureaMmol = convertBUNtoUreaMmol(28);
 * // Returns: 9.996 (28 × 0.357)
 */
export function convertBUNtoUreaMmol(bunMgDl: number): number {
  // BUN (mg/dL) × 0.357 = Urea (mmol/L)
  return bunMgDl * 0.357;
}
