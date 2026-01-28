/**
 * Calculator Data Definitions
 * All 52 calculators with metadata, inputs, and interpretation guides
 */

export interface CalculatorInput {
  id: string;
  label: string;
  type: "number" | "select" | "checkbox" | "radio";
  unit?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export interface Calculator {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: CalculatorInput[];
  resultLabel: string;
  resultUnit?: string;
  interpretation: (value: number) => string;
  clinicalPearls: string[];
  references: string[];
}

export const calculators: Calculator[] = [
  // ============================================================================
  // KIDNEY FUNCTION & CKD RISK
  // ============================================================================

  {
    id: "ckd-epi-creatinine",
    name: "CKD-EPI Creatinine (2021)",
    description: "Estimated GFR using serum creatinine (most commonly used)",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.0", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true, min: 18, max: 120 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "race", label: "Race", type: "select", options: [{ value: "Black", label: "African American" }, { value: "Other", label: "Other" }], required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL (conventional)" }, { value: "μmol/L", label: "μmol/L (SI)" }], required: true },
    ],
    resultLabel: "eGFR",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 90) return "Normal kidney function (CKD Stage 1)";
      if (value >= 60) return "Mild decrease in kidney function (CKD Stage 2)";
      if (value >= 45) return "Mild to moderate decrease (CKD Stage 3a)";
      if (value >= 30) return "Moderate to severe decrease (CKD Stage 3b)";
      if (value >= 15) return "Severe decrease in kidney function (CKD Stage 4)";
      return "Kidney failure (CKD Stage 5) - Consider dialysis/transplant planning";
    },
    clinicalPearls: [
      "Most accurate creatinine-based eGFR equation",
      "Accounts for sex, race, and age",
      "Use for CKD staging and medication dosing",
      "Compare with cystatin C if creatinine unreliable",
    ],
    references: ["Inker LA et al. N Engl J Med. 2021;385(19):1737-1749"],
  },

  {
    id: "cockcroft-gault",
    name: "Cockcroft-Gault Creatinine Clearance",
    description: "Estimates creatinine clearance; still used for drug dosing",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.0", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true },
      { id: "weight", label: "Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "Creatinine Clearance",
    resultUnit: "mL/min",
    interpretation: (value) => {
      if (value >= 90) return "Normal kidney function";
      if (value >= 60) return "Mild reduction";
      if (value >= 30) return "Moderate reduction";
      return "Severe reduction - adjust drug dosing";
    },
    clinicalPearls: [
      "Overestimates eGFR compared to CKD-EPI",
      "Still used for aminoglycoside and vancomycin dosing",
      "Less accurate in elderly and obese patients",
    ],
    references: ["Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41"],
  },

  {
    id: "schwartz-pediatric",
    name: "Schwartz Pediatric eGFR",
    description: "Estimates GFR in children and adolescents",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "0.5", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm", placeholder: "140", required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "eGFR",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 90) return "Normal kidney function";
      if (value >= 60) return "Mild decrease";
      if (value >= 30) return "Moderate decrease";
      return "Severe decrease - nephrologist referral needed";
    },
    clinicalPearls: [
      "Use in children and adolescents",
      "Height-dependent formula",
      "Updated versions available for different age groups",
    ],
    references: ["Schwartz GJ et al. Kidney Int. 2009;76(2):159-166"],
  },

  {
    id: "kinetic-egfr",
    name: "Kinetic eGFR",
    description: "Calculates GFR from urea kinetics during dialysis",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "preBUN", label: "Pre-Dialysis BUN", type: "number", unit: "mg/dL or mmol/L", placeholder: "60", required: true },
      { id: "postBUN", label: "Post-Dialysis BUN", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "preCreatinine", label: "Pre-Dialysis Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "8", required: true },
      { id: "postCreatinine", label: "Post-Dialysis Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "6", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sessionTime", label: "Session Duration", type: "number", unit: "hours", placeholder: "4", required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "Residual eGFR",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 2) return "Significant residual kidney function - preserve it!";
      if (value > 0) return "Minimal residual function";
      return "No residual kidney function";
    },
    clinicalPearls: [
      "Assesses residual kidney function in dialysis patients",
      "Preservation of RKF improves survival",
      "Protect RKF: avoid NSAIDs, maintain euvolemia",
    ],
    references: ["KDIGO 2024 CKD Guideline"],
  },

  {
    id: "ckd-epi-cystatin-c",
    name: "CKD-EPI Creatinine-Cystatin C Combined",
    description: "More accurate eGFR using both creatinine and cystatin C",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "creatinine", label: "Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.0", required: true },
      { id: "cystatinC", label: "Cystatin C", type: "number", unit: "mg/L", placeholder: "0.8", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "eGFR",
    resultUnit: "mL/min/1.73m²",
    interpretation: (value) => {
      if (value >= 90) return "Normal kidney function";
      if (value >= 60) return "Mild decrease";
      if (value >= 30) return "Moderate to severe decrease";
      return "Severe decrease - kidney failure";
    },
    clinicalPearls: [
      "Less biased than creatinine-only equation",
      "Useful in extremes of muscle mass (sarcopenia, athletes)",
      "Recommended when creatinine-based eGFR doesn't fit clinical picture",
    ],
    references: ["Inker LA et al. N Engl J Med. 2021;385(19):1737-1749"],
  },

  {
    id: "egfr-slope",
    name: "Annual eGFR Decline (Slope)",
    description: "Calculates rate of kidney function decline over time",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "eGFRBaseline", label: "Baseline eGFR", type: "number", unit: "mL/min/1.73m²", placeholder: "60", required: true },
      { id: "eGFRFinal", label: "Final eGFR", type: "number", unit: "mL/min/1.73m²", placeholder: "45", required: true },
      { id: "timeYears", label: "Time Period", type: "number", unit: "years", placeholder: "2", required: true, min: 0.5, max: 20 },
    ],
    resultLabel: "eGFR Decline Rate",
    resultUnit: "mL/min/1.73m²/year",
    interpretation: (value) => {
      if (value > -1) return "Normal aging rate";
      if (value > -3) return "Mild CKD progression";
      if (value > -5) return "Moderate CKD progression";
      return "Rapid progression - investigate for acute process or adjust treatment";
    },
    clinicalPearls: [
      "Normal aging: -0.5 to -1 mL/min/1.73m²/year",
      ">20% decline in 1 year suggests acute process",
      ">30% acute dip acceptable after RAAS inhibitor initiation",
    ],
    references: ["KDIGO 2024 CKD Guideline, Practice Point 2.1.3"],
  },

  {
    id: "kfre",
    name: "Kidney Failure Risk Equation (KFRE)",
    description: "Predicts 2 and 5-year probability of kidney failure",
    category: "Kidney Function & CKD Risk",
    inputs: [
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "55", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "eGFR", label: "eGFR", type: "number", unit: "mL/min/1.73m²", placeholder: "35", required: true },
      { id: "acr", label: "Albumin-Creatinine Ratio", type: "number", unit: "mg/g", placeholder: "150", required: true },
      { id: "years", label: "Prediction Timeframe", type: "select", options: [{ value: "2", label: "2-year risk" }, { value: "5", label: "5-year risk" }], required: true },
    ],
    resultLabel: "Kidney Failure Risk",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 3) return "Low risk - routine follow-up";
      if (value < 5) return "Borderline - consider nephrology referral";
      if (value < 20) return "Moderate risk - nephrology referral recommended";
      if (value < 40) return "High risk - intensive management";
      return "Very high risk - consider early transplant/dialysis planning";
    },
    clinicalPearls: [
      "Most validated CKD progression risk tool",
      "KDIGO 2024 recommends referral when 5-year risk ≥3-5%",
      "Risk >40% at 2 years = consider early transplant evaluation",
    ],
    references: ["Tangri N et al. JAMA. 2016;315(2):164-174"],
  },

  // ============================================================================
  // ACUTE KIDNEY INJURY (AKI) WORKUP
  // ============================================================================

  {
    id: "fena",
    name: "Fractional Excretion of Sodium (FENa)",
    description: "Differentiates prerenal from intrinsic AKI",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urineNa", label: "Urine Sodium", type: "number", unit: "mEq/L", placeholder: "20", required: true },
      { id: "plasmaCr", label: "Plasma Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "2.0", required: true },
      { id: "plasmaNa", label: "Plasma Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "urineCr", label: "Urine Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "80", required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "FENa",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 1) return "Prerenal azotemia (volume depletion, heart failure, cirrhosis)";
      if (value <= 2) return "Indeterminate - consider clinical context";
      return "Intrinsic AKI (acute tubular necrosis most likely)";
    },
    clinicalPearls: [
      "Classic tool for AKI differential diagnosis",
      "Unreliable in diuretic use, CKD, contrast nephropathy, pigment nephropathy",
      "Must interpret with clinical context (volume status, urine sediment)",
    ],
    references: ["Steiner RW. Am J Med. 1984;77(4):699-702"],
  },

  {
    id: "feurea",
    name: "Fractional Excretion of Urea (FEUrea)",
    description: "Alternative to FENa, more reliable with diuretic use",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urineUrea", label: "Urine Urea Nitrogen", type: "number", unit: "mg/dL", placeholder: "200", required: true },
      { id: "plasmaCr", label: "Plasma Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "2.0", required: true },
      { id: "plasmaUrea", label: "Plasma Urea Nitrogen", type: "number", unit: "mg/dL", placeholder: "40", required: true },
      { id: "urineCr", label: "Urine Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "80", required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "FEUrea",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 35) return "Prerenal azotemia";
      if (value <= 50) return "Indeterminate";
      return "Intrinsic AKI (acute tubular necrosis)";
    },
    clinicalPearls: [
      "Superior to FENa in patients on diuretics",
      "Urea reabsorption unaffected by diuretics",
      "Limited added diagnostic value over FENa per recent meta-analysis",
    ],
    references: ["Carvounis CP et al. Kidney Int. 2002;62(6):2223-2229"],
  },

  {
    id: "anion-gap",
    name: "Serum Anion Gap",
    description: "First step in metabolic acidosis workup",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "sodium", label: "Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "chloride", label: "Chloride", type: "number", unit: "mEq/L", placeholder: "105", required: true },
      { id: "bicarbonate", label: "Bicarbonate", type: "number", unit: "mEq/L", placeholder: "20", required: true },
    ],
    resultLabel: "Anion Gap",
    resultUnit: "mEq/L",
    interpretation: (value) => {
      if (value <= 12) return "Normal anion gap (NAGMA) - think HARDUPS";
      if (value <= 16) return "Borderline high";
      return "High anion gap (HAGMA) - think GOLDMARK";
    },
    clinicalPearls: [
      "Modern analyzers: normal 8-12 mEq/L",
      "Correct for hypoalbuminemia: Expected AG = 2.5 × Albumin (g/dL)",
      "Essential in DKA, lactic acidosis, toxic ingestions",
    ],
    references: ["Kraut JA, Madias NE. Clin J Am Soc Nephrol. 2007;2(1):162-174"],
  },

  {
    id: "delta-gap",
    name: "Delta Gap (Delta-Delta Ratio)",
    description: "Identifies mixed acid-base disorders",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "measuredAG", label: "Measured Anion Gap", type: "number", unit: "mEq/L", placeholder: "20", required: true },
      { id: "measuredHCO3", label: "Measured HCO3", type: "number", unit: "mEq/L", placeholder: "15", required: true },
      { id: "normalAG", label: "Normal AG", type: "number", unit: "mEq/L", placeholder: "12", required: true },
      { id: "normalHCO3", label: "Normal HCO3", type: "number", unit: "mEq/L", placeholder: "24", required: true },
    ],
    resultLabel: "Delta-Delta Ratio",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value >= 1 && value <= 2) return "Pure high anion gap metabolic acidosis";
      if (value < 1) return "Combined HAGMA + normal anion gap metabolic acidosis";
      return "Combined HAGMA + metabolic alkalosis";
    },
    clinicalPearls: [
      "Identifies mixed acid-base disorders",
      "Essential in DKA (concomitant vomiting causes alkalosis)",
      "Guides treatment strategy",
    ],
    references: ["Rastegar A. J Am Soc Nephrol. 2007;18(9):2429-2431"],
  },

  {
    id: "osmolal-gap",
    name: "Serum Osmolal Gap",
    description: "Screens for toxic alcohol ingestion",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "measuredOsmolality", label: "Measured Osmolality", type: "number", unit: "mOsm/kg", placeholder: "320", required: true },
      { id: "sodium", label: "Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "glucose", label: "Glucose", type: "number", unit: "mg/dL or mmol/L", placeholder: "100", required: true },
      { id: "bun", label: "BUN", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "ethanol", label: "Ethanol (if known)", type: "number", unit: "mg/dL", placeholder: "0" },
      { id: "glucoseUnit", label: "Glucose Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
      { id: "bunUnit", label: "BUN Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
    ],
    resultLabel: "Osmolal Gap",
    resultUnit: "mOsm/kg",
    interpretation: (value) => {
      if (value <= 10) return "Normal - no unmeasured osmotically active substances";
      if (value <= 20) return "Borderline - consider toxic alcohol ingestion";
      return "Elevated - suggests methanol, ethylene glycol, isopropanol, or other toxins";
    },
    clinicalPearls: [
      "Critical in suspected toxic alcohol ingestion with HAGMA",
      "Gap normalizes as alcohols metabolize to acids",
      "Nephrology consult for hemodialysis if severe",
    ],
    references: ["Kraut JA, Kurtz I. Clin J Am Soc Nephrol. 2008;3(1):208-225"],
  },

  {
    id: "urine-anion-gap",
    name: "Urine Anion Gap (for RTA diagnosis)",
    description: "Differentiates renal vs. GI causes of normal AG acidosis",
    category: "Acute Kidney Injury (AKI) Workup",
    inputs: [
      { id: "urineNa", label: "Urine Sodium", type: "number", unit: "mEq/L", placeholder: "40", required: true },
      { id: "urineK", label: "Urine Potassium", type: "number", unit: "mEq/L", placeholder: "20", required: true },
      { id: "urineCl", label: "Urine Chloride", type: "number", unit: "mEq/L", placeholder: "50", required: true },
    ],
    resultLabel: "Urine Anion Gap",
    resultUnit: "mEq/L",
    interpretation: (value) => {
      if (value < -20) return "Negative UAG - intact renal acidification (GI HCO3 losses or proximal RTA)";
      if (value <= 20) return "Equivocal - may need urine pH and NH4+ measurement";
      return "Positive UAG - impaired renal NH4+ excretion (distal RTA or Type 4 RTA)";
    },
    clinicalPearls: [
      "Differentiates renal vs. GI causes of normal AG metabolic acidosis",
      "Urine pH helps further: pH >5.5 in acidosis = distal RTA",
      "Type 1 RTA: positive UAG, urine pH >5.5, may have stones",
    ],
    references: ["Batlle DC et al. N Engl J Med. 1988;318(10):594-599"],
  },

  // ============================================================================
  // ELECTROLYTES & ACID-BASE
  // ============================================================================

  {
    id: "ttkg",
    name: "Transtubular Potassium Gradient (TTKG)",
    description: "Helps distinguish renal vs. extrarenal causes of K disorders",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "urineK", label: "Urine Potassium", type: "number", unit: "mEq/L", placeholder: "40", required: true },
      { id: "plasmaK", label: "Plasma Potassium", type: "number", unit: "mEq/L", placeholder: "5.5", required: true },
      { id: "urineOsm", label: "Urine Osmolality", type: "number", unit: "mOsm/kg", placeholder: "400", required: true },
      { id: "plasmaOsm", label: "Plasma Osmolality", type: "number", unit: "mOsm/kg", placeholder: "290", required: true },
    ],
    resultLabel: "TTKG",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value < 6) return "Low TTKG in hyperkalemia - suggests hypoaldosteronism or aldosterone resistance";
      if (value > 3 && value < 8) return "Normal TTKG";
      if (value > 8) return "High TTKG in hypokalemia - suggests renal K wasting";
      return "Validity criteria not met (need urine Osm >300 and urine Na >25)";
    },
    clinicalPearls: [
      "Validity criteria: urine Osm >300 mOsm/kg and urine Na >25 mEq/L",
      "Normal on regular diet: 8-9",
      "Utility debated; some experts recommend direct urine K measurement",
    ],
    references: ["Ethier JH et al. Am J Kidney Dis. 1990;15(4):309-315"],
  },

  {
    id: "water-deficit-hypernatremia",
    name: "Water Deficit in Hypernatremia",
    description: "Calculates free water needed to correct hypernatremia",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "currentNa", label: "Current Serum Sodium", type: "number", unit: "mEq/L", placeholder: "160", required: true },
      { id: "targetNa", label: "Target Serum Sodium", type: "number", unit: "mEq/L", placeholder: "140", required: true },
      { id: "totalBodyWater", label: "Total Body Water", type: "number", unit: "L", placeholder: "42", required: true },
    ],
    resultLabel: "Free Water Deficit",
    resultUnit: "L",
    interpretation: (value) => {
      if (value <= 1) return "Mild deficit - oral rehydration may suffice";
      if (value <= 3) return "Moderate deficit - IV D5W or hypotonic saline";
      return "Severe deficit - careful IV rehydration needed to avoid cerebral edema";
    },
    clinicalPearls: [
      "Correct slowly: no more than 10-12 mEq/L in 24 hours",
      "Rapid correction risks cerebral edema",
      "Address underlying cause (diabetes insipidus, insensible losses)",
    ],
    references: ["Adrogue HJ, Madias NE. N Engl J Med. 2000;342(20):1493-1499"],
  },

  {
    id: "corrected-sodium-hyperglycemia",
    name: "Corrected Sodium in Hyperglycemia",
    description: "Adjusts sodium for osmotic effect of hyperglycemia",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "measuredNa", label: "Measured Serum Sodium", type: "number", unit: "mEq/L", placeholder: "130", required: true },
      { id: "glucose", label: "Serum Glucose", type: "number", unit: "mg/dL or mmol/L", placeholder: "500", required: true },
      { id: "glucoseUnit", label: "Glucose Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
    ],
    resultLabel: "Corrected Sodium",
    resultUnit: "mEq/L",
    interpretation: (value) => {
      if (value >= 135) return "Sodium normal when corrected for hyperglycemia";
      if (value >= 130) return "Mild hyponatremia";
      return "Significant hyponatremia - requires careful correction";
    },
    clinicalPearls: [
      "Each 100 mg/dL glucose above 100 lowers Na by ~2-3 mEq/L",
      "Critical in DKA and HHS management",
      "Corrected Na guides treatment decisions",
    ],
    references: ["Katz MA. N Engl J Med. 1973;289(16):843-844"],
  },

  {
    id: "sodium-correction-rate",
    name: "Sodium Correction Rate in Hyponatremia",
    description: "Calculates rate of sodium change with fluid administration",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "currentNa", label: "Current Serum Sodium", type: "number", unit: "mEq/L", placeholder: "120", required: true },
      { id: "targetNa", label: "Target Serum Sodium", type: "number", unit: "mEq/L", placeholder: "130", required: true },
      { id: "infusionNa", label: "Infusate Sodium Concentration", type: "number", unit: "mEq/L", placeholder: "154", required: true },
      { id: "totalBodyWater", label: "Total Body Water", type: "number", unit: "L", placeholder: "42", required: true },
      { id: "correctionHours", label: "Correction Period", type: "number", unit: "hours", placeholder: "24", required: true },
    ],
    resultLabel: "Correction Rate",
    resultUnit: "mEq/L/hour",
    interpretation: (value) => {
      if (value <= 6) return "Safe correction rate";
      if (value <= 8) return "Acceptable rate";
      if (value <= 10) return "Risk of osmotic demyelination syndrome - slow correction";
      return "Too rapid - risk of serious neurological complications";
    },
    clinicalPearls: [
      "Maximum safe rate: 6-8 mEq/L in 24 hours",
      "Rapid correction risks osmotic demyelination syndrome",
      "Chronic hyponatremia requires slower correction",
    ],
    references: ["Adrogue HJ, Madias NE. N Engl J Med. 2000;342(20):1493-1499"],
  },

  {
    id: "sodium-deficit",
    name: "Sodium Deficit in Hyponatremia",
    description: "Calculates total sodium needed to correct hyponatremia",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "currentNa", label: "Current Serum Sodium", type: "number", unit: "mEq/L", placeholder: "120", required: true },
      { id: "targetNa", label: "Target Serum Sodium", type: "number", unit: "mEq/L", placeholder: "130", required: true },
      { id: "totalBodyWater", label: "Total Body Water", type: "number", unit: "L", placeholder: "42", required: true },
    ],
    resultLabel: "Sodium Deficit",
    resultUnit: "mEq",
    interpretation: (value) => {
      if (value <= 100) return "Mild deficit - may use hypotonic saline or fluid restriction";
      if (value <= 300) return "Moderate deficit - hypertonic saline (3%) may be needed";
      return "Severe deficit - careful IV hypertonic saline with monitoring";
    },
    clinicalPearls: [
      "Guides choice of IV fluid and rate of administration",
      "Acute hyponatremia (<48 hours) needs faster correction",
      "Chronic hyponatremia needs slower correction",
    ],
    references: ["Adrogue HJ, Madias NE. N Engl J Med. 2000;342(20):1493-1499"],
  },

  {
    id: "corrected-calcium",
    name: "Corrected Calcium for Albumin",
    description: "Adjusts total calcium for hypoalbuminemia",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "measuredCa", label: "Measured Total Calcium", type: "number", unit: "mg/dL", placeholder: "7.5", required: true },
      { id: "albumin", label: "Serum Albumin", type: "number", unit: "g/dL or g/L", placeholder: "2.0", required: true },
      { id: "albuminUnit", label: "Albumin Unit", type: "select", options: [{ value: "g/dL", label: "g/dL" }, { value: "g/L", label: "g/L" }], required: true },
    ],
    resultLabel: "Corrected Calcium",
    resultUnit: "mg/dL",
    interpretation: (value) => {
      if (value >= 8.5 && value <= 10.5) return "Normal corrected calcium";
      if (value < 8.5) return "Hypocalcemia - may need supplementation";
      return "Hypercalcemia - investigate cause";
    },
    clinicalPearls: [
      "~40% of serum calcium is albumin-bound",
      "Ionized calcium measurement is gold standard",
      "Less accurate in severe acid-base disturbances",
    ],
    references: ["Payne RB et al. Br Med J. 1973;4(5893):643-646"],
  },

  {
    id: "qtc-bazett",
    name: "Corrected QT Interval (QTc - Bazett)",
    description: "Calculates heart rate-corrected QT interval",
    category: "Electrolytes & Acid-Base",
    inputs: [
      { id: "qtInterval", label: "QT Interval", type: "number", unit: "ms", placeholder: "400", required: true },
      { id: "heartRate", label: "Heart Rate", type: "number", unit: "bpm", placeholder: "80", required: true, min: 40, max: 200 },
    ],
    resultLabel: "QTc",
    resultUnit: "ms",
    interpretation: (value) => {
      if (value <= 450) return "Normal (men)";
      if (value <= 460) return "Normal (women)";
      if (value <= 500) return "Prolonged - monitor, correct electrolytes";
      return "Severely prolonged - risk of torsades de pointes, urgent intervention needed";
    },
    clinicalPearls: [
      "Normal: Men <450 ms, Women <460 ms",
      "Causes: hypokalemia, hypocalcemia, hypomagnesemia, medications",
      "Correct electrolytes urgently if QTc >500 ms",
    ],
    references: ["Rautaharju PM et al. Circulation. 2009;119(10):e241-e250"],
  },

  // ============================================================================
  // PROTEINURIA & GLOMERULAR DISEASE
  // ============================================================================

  {
    id: "uacr",
    name: "Urine Albumin-to-Creatinine Ratio (uACR)",
    description: "Quantifies albuminuria - key CKD marker",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "urineAlbumin", label: "Urine Albumin", type: "number", unit: "mg or μg", placeholder: "150", required: true },
      { id: "urineCreatinine", label: "Urine Creatinine", type: "number", unit: "g or mg", placeholder: "1.0", required: true },
      { id: "albuminUnit", label: "Albumin Unit", type: "select", options: [{ value: "mg", label: "mg" }, { value: "μg", label: "μg" }], required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "g", label: "g" }, { value: "mg", label: "mg" }], required: true },
    ],
    resultLabel: "uACR",
    resultUnit: "mg/g",
    interpretation: (value) => {
      if (value < 30) return "A1: Normal to mildly increased albuminuria";
      if (value < 300) return "A2: Moderately increased albuminuria (formerly microalbuminuria)";
      if (value < 2200) return "A3: Severely increased albuminuria (formerly macroalbuminuria)";
      return "Nephrotic range albuminuria - requires aggressive treatment";
    },
    clinicalPearls: [
      "Key CKD marker; predicts progression and CVD events",
      "Required for KFRE calculation",
      "Use first morning void when possible",
      "Target: 30-50% reduction with treatment",
    ],
    references: ["KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD"],
  },

  {
    id: "upcr",
    name: "Urine Protein-to-Creatinine Ratio (UPCR)",
    description: "Quantifies total proteinuria - preferred in nephrotic syndrome",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "urineProtein", label: "Urine Total Protein", type: "number", unit: "mg or g", placeholder: "500", required: true },
      { id: "urineCreatinine", label: "Urine Creatinine", type: "number", unit: "mg or g", placeholder: "100", required: true },
      { id: "proteinUnit", label: "Protein Unit", type: "select", options: [{ value: "mg", label: "mg" }, { value: "g", label: "g" }], required: true },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg", label: "mg" }, { value: "g", label: "g" }], required: true },
    ],
    resultLabel: "UPCR",
    resultUnit: "g/g",
    interpretation: (value) => {
      if (value < 0.15) return "Normal proteinuria";
      if (value < 0.5) return "Mild proteinuria";
      if (value < 1) return "Moderate proteinuria";
      if (value < 3) return "Heavy proteinuria";
      return "Nephrotic range proteinuria (>3 g/g)";
    },
    clinicalPearls: [
      "Replaces 24-hour urine collection in most cases",
      "Preferred in nephrotic syndrome, amyloidosis, myeloma",
      "UPCR (g/g) ≈ 24-hour proteinuria (g/24h)",
      "GN monitoring: target <0.5-1 g/g with immunosuppression",
    ],
    references: ["Levey AS et al. UpToDate 2024"],
  },

  {
    id: "acr-from-pcr",
    name: "Estimated ACR from PCR (conversion)",
    description: "Estimates albumin-creatinine ratio from total protein",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "pcr", label: "Urine Protein-Creatinine Ratio", type: "number", unit: "g/g", placeholder: "1.5", required: true },
    ],
    resultLabel: "Estimated ACR",
    resultUnit: "mg/g",
    interpretation: (value) => {
      if (value < 30) return "A1: Normal to mildly increased";
      if (value < 300) return "A2: Moderately increased";
      return "A3: Severely increased";
    },
    clinicalPearls: [
      "Allows use of KFRE when only PCR available",
      "Simplified conversion: ACR ≈ PCR × 700",
      "Not a substitute for direct ACR measurement when precision needed",
    ],
    references: ["Sumida K et al. Ann Intern Med. 2020;173(6):426-435"],
  },

  {
    id: "igan-prediction",
    name: "International IgA Nephropathy (IgAN) Prediction Tool",
    description: "Predicts 2, 5, and 7-year risk of kidney failure in IgAN",
    category: "Proteinuria & Glomerular Disease",
    inputs: [
      { id: "age", label: "Age at Biopsy", type: "number", unit: "years", placeholder: "35", required: true },
      { id: "eGFR", label: "eGFR at Biopsy", type: "number", unit: "mL/min/1.73m²", placeholder: "60", required: true },
      { id: "map", label: "Mean Arterial Pressure", type: "number", unit: "mmHg", placeholder: "95", required: true },
      { id: "proteinuria", label: "Proteinuria", type: "number", unit: "g/day", placeholder: "1.5", required: true },
      { id: "years", label: "Prediction Timeframe", type: "select", options: [{ value: "2", label: "2-year risk" }, { value: "5", label: "5-year risk" }, { value: "7", label: "7-year risk" }], required: true },
    ],
    resultLabel: "Kidney Failure Risk",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 20) return "Low risk - conservative management (RAAS blockade, SGLT2i)";
      if (value < 40) return "Intermediate risk - consider immunosuppression";
      return "High risk - immunosuppression recommended";
    },
    clinicalPearls: [
      "Most validated prognostic tool for IgAN",
      "Guides treatment intensity decisions",
      "High-risk: persistent proteinuria >1 g/day despite 3-6 months optimal supportive care",
      "External validation in >4000 patients",
    ],
    references: ["Barbour SJ et al. JAMA Intern Med. 2019;179(7):942-952"],
  },

  // ============================================================================
  // DIALYSIS ADEQUACY
  // ============================================================================

  {
    id: "ktv-hemodialysis",
    name: "Kt/V (Hemodialysis Adequacy)",
    description: "Measures dialysis dose - most important adequacy parameter",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "preBUN", label: "Pre-Dialysis BUN", type: "number", unit: "mg/dL or mmol/L", placeholder: "60", required: true },
      { id: "postBUN", label: "Post-Dialysis BUN", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sessionTime", label: "Session Duration", type: "number", unit: "hours", placeholder: "4", required: true },
      { id: "bunUnit", label: "BUN Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
    ],
    resultLabel: "Kt/V",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value >= 1.4) return "Adequate dialysis (≥1.4 recommended)";
      if (value >= 1.2) return "Borderline adequate";
      return "Inadequate dialysis - increase session time or frequency";
    },
    clinicalPearls: [
      "Target: ≥1.4 for 3×/week HD",
      "Accounts for body size and session duration",
      "Does not account for residual kidney function",
      "Post-BUN must be drawn correctly (slow flow or stop pump 15 sec before)",
    ],
    references: ["KDOQI Hemodialysis Adequacy Guidelines 2015"],
  },

  {
    id: "total-body-water",
    name: "Total Body Water (Watson Formula)",
    description: "Estimates total body water for Kt/V calculations",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "55", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
    ],
    resultLabel: "Total Body Water",
    resultUnit: "L",
    interpretation: (value) => {
      if (value > 0) return `Estimated TBW: ${value.toFixed(1)} L - use for Kt/V calculations`;
      return "Unable to calculate";
    },
    clinicalPearls: [
      "Used in Kt/V calculation (V = TBW)",
      "Accounts for age and sex differences",
      "Males typically 50-60% of body weight",
      "Females typically 45-50% of body weight",
    ],
    references: ["Watson PE et al. Am J Clin Nutr. 1980;33(12):2641-2645"],
  },

  {
    id: "hd-session-duration",
    name: "Hemodialysis Session Duration from Target Kt/V",
    description: "Calculates required session time to achieve target Kt/V",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "targetKtV", label: "Target Kt/V", type: "number", unit: "ratio", placeholder: "1.4", required: true },
      { id: "preBUN", label: "Pre-Dialysis BUN", type: "number", unit: "mg/dL or mmol/L", placeholder: "60", required: true },
      { id: "postBUN", label: "Post-Dialysis BUN", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "bunUnit", label: "BUN Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
    ],
    resultLabel: "Required Session Duration",
    resultUnit: "minutes",
    interpretation: (value) => {
      if (value <= 240) return `${(value / 60).toFixed(1)} hours - standard session`;
      if (value <= 300) return `${(value / 60).toFixed(1)} hours - extended session`;
      return `${(value / 60).toFixed(1)} hours - very extended session - consider nocturnal HD`;
    },
    clinicalPearls: [
      "Helps prescribe adequate dialysis dose",
      "Adjust for individual patient factors",
      "More frequent or longer sessions improve outcomes",
    ],
    references: ["Daugirdas JT. Adv Ren Replace Ther. 1995;2(4):295-304"],
  },

  {
    id: "pd-weekly-ktv",
    name: "Peritoneal Dialysis Weekly Kt/V",
    description: "Assesses solute clearance adequacy in CAPD/APD",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "dailyDialysateUrea", label: "Daily Dialysate Urea", type: "number", unit: "mg/dL", placeholder: "200", required: true },
      { id: "plasmaUrea", label: "Plasma Urea", type: "number", unit: "mg/dL", placeholder: "40", required: true },
      { id: "dialysateVolume", label: "Daily Dialysate Volume", type: "number", unit: "L", placeholder: "8", required: true },
      { id: "totalBodyWater", label: "Total Body Water", type: "number", unit: "L", placeholder: "42", required: true },
      { id: "residualKtv", label: "Residual Renal Kt/V", type: "number", unit: "ratio", placeholder: "0.1" },
    ],
    resultLabel: "Weekly PD Kt/V",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value >= 2.0) return "Optimal PD adequacy (≥2.0 recommended)";
      if (value >= 1.7) return "Minimum adequate PD (≥1.7 minimum)";
      return "Inadequate PD - increase dwell time, add exchange, or consider HD transition";
    },
    clinicalPearls: [
      "Includes both peritoneal and residual renal clearance",
      "Measured every 6 months or when clinically indicated",
      "Low Kt/V associated with malnutrition, inflammation, mortality",
      "Preserve residual kidney function",
    ],
    references: ["ISPD Guidelines 2020: Peritoneal Dialysis Adequacy"],
  },

  {
    id: "residual-rkf-ktv",
    name: "Residual Kidney Function (RKF) Kt/V Component",
    description: "Quantifies contribution of residual kidney function to clearance",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "ureaUrineClearance", label: "Urine Urea Clearance", type: "number", unit: "mL/min", placeholder: "5", required: true },
      { id: "totalBodyWater", label: "Total Body Water", type: "number", unit: "L", placeholder: "42", required: true },
    ],
    resultLabel: "Residual Kt/V",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value >= 0.2) return "Significant residual kidney function - preserve it!";
      if (value >= 0.1) return "Moderate residual function";
      if (value > 0) return "Minimal residual function";
      return "No residual kidney function";
    },
    clinicalPearls: [
      "Preservation of RKF = better survival, fluid balance, phosphate control",
      "Measure RKF if urine output ≥100 mL/day",
      "Protect RKF: avoid NSAIDs, aminoglycosides, contrast, maintain euvolemia",
      "RKF loss faster in HD than PD",
    ],
    references: ["Bargman JM et al. J Am Soc Nephrol. 2001;12(10):2158-2162"],
  },

  {
    id: "equilibrated-ktv",
    name: "Equilibrated Kt/V (eKt/V) for Hemodialysis",
    description: "Accounts for post-dialysis urea rebound",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "spKtv", label: "Single-Pool Kt/V", type: "number", unit: "ratio", placeholder: "1.3", required: true },
      { id: "sessionTime", label: "Session Duration", type: "number", unit: "hours", placeholder: "4", required: true },
    ],
    resultLabel: "Equilibrated Kt/V",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value >= 1.2) return "Adequate eKt/V";
      if (value >= 1.0) return "Borderline adequate";
      return "Inadequate - increase dialysis dose";
    },
    clinicalPearls: [
      "Accounts for post-dialysis urea rebound (30-60 min after HD)",
      "More accurate than spKt/V",
      "Typically 0.1-0.2 lower than spKt/V",
      "Important for short, high-efficiency dialysis",
    ],
    references: ["Daugirdas JT. Adv Ren Replace Ther. 1995;2(4):295-304"],
  },

  {
    id: "standard-ktv",
    name: "Standard Kt/V (stdKt/V) - Weekly Normalized Dose",
    description: "Converts intermittent HD dose to continuous equivalent clearance",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "spKtv", label: "Single-Pool Kt/V", type: "number", unit: "ratio", placeholder: "1.3", required: true },
      { id: "residualKtv", label: "Residual Kidney Function Kt/V", type: "number", unit: "ratio", placeholder: "0.1" },
    ],
    resultLabel: "Standard Kt/V",
    resultUnit: "ratio/week",
    interpretation: (value) => {
      if (value >= 2.3) return "Adequate stdKt/V (≥2.3 recommended)";
      if (value >= 2.1) return "Borderline adequate";
      return "Inadequate - increase dialysis frequency or duration";
    },
    clinicalPearls: [
      "Allows comparison across different HD schedules",
      "Accounts for dialysis frequency and residual function",
      "Recommended by KDOQI as preferred adequacy measure",
      "Complex calculation - use HD machine software",
    ],
    references: ["KDOQI Clinical Practice Guideline for Hemodialysis Adequacy: 2015 Update"],
  },

  {
    id: "urr",
    name: "Urea Reduction Ratio (URR)",
    description: "Simplest measure of hemodialysis adequacy",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "preBUN", label: "Pre-Dialysis BUN", type: "number", unit: "mg/dL or mmol/L", placeholder: "60", required: true },
      { id: "postBUN", label: "Post-Dialysis BUN", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "bunUnit", label: "BUN Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
    ],
    resultLabel: "URR",
    resultUnit: "%",
    interpretation: (value) => {
      if (value >= 70) return "Optimal URR (≥70% recommended)";
      if (value >= 65) return "Minimum adequate URR (≥65% minimum)";
      return "Inadequate dialysis - increase session time or frequency";
    },
    clinicalPearls: [
      "Simplest measure - does not require weight or session time",
      "Underestimates adequacy in short session/high UF",
      "URR 65% ≈ Kt/V 1.2; URR 70% ≈ Kt/V 1.4",
      "Post-BUN must be drawn correctly (slow flow or stop pump 15 sec)",
    ],
    references: ["KDOQI Hemodialysis Adequacy Guidelines 2015"],
  },

  {
    id: "iron-deficit",
    name: "Iron Deficit (Ganzoni Formula)",
    description: "Calculates total iron needed to correct anemia",
    category: "Dialysis Adequacy",
    inputs: [
      { id: "targetHemoglobin", label: "Target Hemoglobin", type: "number", unit: "g/dL", placeholder: "11", required: true },
      { id: "currentHemoglobin", label: "Current Hemoglobin", type: "number", unit: "g/dL", placeholder: "8", required: true },
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
    ],
    resultLabel: "Total Iron Needed",
    resultUnit: "mg",
    interpretation: (value) => {
      if (value <= 500) return "Mild iron deficit - oral iron may suffice";
      if (value <= 1000) return "Moderate deficit - IV iron likely needed";
      return "Severe deficit - significant IV iron supplementation required";
    },
    clinicalPearls: [
      "Accounts for hemoglobin deficit + iron stores",
      "Iron stores: ~500 mg (men), ~300 mg (women)",
      "IV iron preferred in dialysis patients",
      "Monitor ferritin and TSAT during repletion",
    ],
    references: ["Ganzoni AM. Schweiz Med Wochenschr. 1970;100(7):301-303"],
  },

  // ============================================================================
  // TRANSPLANTATION
  // ============================================================================

  {
    id: "kdpi",
    name: "Kidney Donor Profile Index (KDPI)",
    description: "Predicts donor kidney quality and graft survival",
    category: "Transplantation",
    inputs: [
      { id: "donorAge", label: "Donor Age", type: "number", unit: "years", placeholder: "45", required: true },
      { id: "donorHeight", label: "Donor Height", type: "number", unit: "cm", placeholder: "170", required: true },
      { id: "donorWeight", label: "Donor Weight", type: "number", unit: "kg", placeholder: "80", required: true },
      { id: "donorCreatinine", label: "Donor Serum Creatinine", type: "number", unit: "mg/dL or μmol/L", placeholder: "1.0", required: true },
      { id: "donorHypertension", label: "Donor History of Hypertension", type: "checkbox" },
      { id: "donorDiabetes", label: "Donor History of Diabetes", type: "checkbox" },
      { id: "donorAfricanAmerican", label: "Donor African American", type: "checkbox" },
      { id: "donorHepCPositive", label: "Donor Hepatitis C Positive", type: "checkbox" },
      { id: "causeOfDeathStroke", label: "Cause of Death: Stroke", type: "checkbox" },
      { id: "donorAfterCirculatoryDeath", label: "Donation After Circulatory Death (DCD)", type: "checkbox" },
      { id: "creatinineUnit", label: "Creatinine Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "μmol/L", label: "μmol/L" }], required: true },
    ],
    resultLabel: "KDPI",
    resultUnit: "%",
    interpretation: (value) => {
      if (value <= 20) return "KDPI 0-20%: Highest quality organs (longevity matching to EPTS ≤20%)";
      if (value <= 85) return "KDPI 21-85%: Standard criteria donors";
      return "KDPI 86-100%: Expanded criteria donors (ECD) - higher discard rate but better than dialysis";
    },
    clinicalPearls: [
      "Replaced ECD classification in US allocation system (2014)",
      "KDPI 100% = reference donor (median donor from prior year)",
      "Does not predict rejection or surgical complications",
      "KDPI >85% kidneys: higher early discard rate but transplant better than dialysis",
    ],
    references: ["Rao PS et al. Transplantation. 2009;88(2):231-236"],
  },

  {
    id: "epts",
    name: "Estimated Post-Transplant Survival (EPTS)",
    description: "Predicts recipient longevity after transplant",
    category: "Transplantation",
    inputs: [
      { id: "recipientAge", label: "Recipient Age", type: "number", unit: "years", placeholder: "50", required: true },
      { id: "recipientDiabetes", label: "Recipient Diabetes", type: "checkbox" },
      { id: "priorTransplant", label: "Prior Solid Organ Transplant", type: "checkbox" },
      { id: "yearsOnDialysis", label: "Years on Dialysis", type: "number", unit: "years", placeholder: "3", required: true },
    ],
    resultLabel: "EPTS",
    resultUnit: "%",
    interpretation: (value) => {
      if (value <= 20) return "EPTS 0-20%: Highest longevity candidates (receive KDPI ≤20% kidneys first)";
      return "EPTS 21-100%: Standard allocation";
    },
    clinicalPearls: [
      "Matches best kidneys to longest-lived recipients",
      "Does not measure medical urgency (unlike liver MELD)",
      "EPTS ≤20% candidates get priority for KDPI ≤20% kidneys nationally",
      "Important for patient counseling on accepting organ offers",
    ],
    references: ["OPTN/UNOS Kidney Allocation System. Final Rule 2014"],
  },

  {
    id: "banff-classification",
    name: "Banff Classification for Kidney Transplant Rejection",
    description: "Framework for kidney transplant biopsy interpretation",
    category: "Transplantation",
    inputs: [
      { id: "category", label: "Diagnostic Category", type: "select", options: [
        { value: "1", label: "1: Normal or nonspecific changes" },
        { value: "2", label: "2: Antibody-Mediated Rejection (ABMR)" },
        { value: "3", label: "3: Borderline Changes" },
        { value: "4", label: "4: T-Cell Mediated Rejection (TCMR)" },
        { value: "5", label: "5: Interstitial Fibrosis/Tubular Atrophy (IF/TA)" },
        { value: "6", label: "6: Other (infection, drug toxicity, recurrent disease)" },
      ], required: true },
    ],
    resultLabel: "Banff Classification",
    resultUnit: "category",
    interpretation: (value) => {
      const interpretations: Record<string, string> = {
        "1": "Normal biopsy or nonspecific changes - no rejection",
        "2": "Antibody-Mediated Rejection - treat with plasmapheresis, IVIG, ± rituximab/bortezomib",
        "3": "Borderline changes - suspicious for TCMR but not meeting full criteria",
        "4": "T-Cell Mediated Rejection - treat with pulse steroids ± thymoglobulin",
        "5": "Chronic changes (IF/TA) - optimization vs. re-transplant consideration",
        "6": "Other pathology - requires specific investigation and treatment",
      };
      return interpretations[value] || "Unknown category";
    },
    clinicalPearls: [
      "International gold standard for transplant biopsy interpretation",
      "Guides immunosuppression adjustment",
      "Prognostic: chronic active ABMR and cg associated with graft loss",
      "Updated annually at Banff meetings",
    ],
    references: ["Loupy A et al. Am J Transplant. 2020;20(9):2305-2331"],
  },

  {
    id: "tacrolimus-monitoring",
    name: "Tacrolimus Therapeutic Monitoring",
    description: "Assesses tacrolimus metabolism and adherence",
    category: "Transplantation",
    inputs: [
      { id: "dailyDose", label: "Daily Tacrolimus Dose", type: "number", unit: "mg", placeholder: "4", required: true },
      { id: "troughLevel", label: "Trough Level", type: "number", unit: "ng/mL", placeholder: "8", required: true },
    ],
    resultLabel: "Dose-to-Trough Ratio",
    resultUnit: "ratio",
    interpretation: (value) => {
      if (value < 1.5) return "Rapid metabolizer (CYP3A5 expresser) - may need higher doses or BID dosing";
      if (value <= 3) return "Normal metabolism";
      return "Slow metabolizer - risk of toxicity, consider dose reduction";
    },
    clinicalPearls: [
      "Typical range: 1.6-2.4",
      "Identifies metabolism phenotype (genetic or drug interaction)",
      "Assesses adherence (high ratio with low level = missed doses)",
      "CYP3A5 expressers more common in African Americans (~50% vs. 10-20% other populations)",
    ],
    references: ["Thölking G et al. Sci Rep. 2016;6:32273"],
  },

  // ============================================================================
  // CARDIOVASCULAR RISK
  // ============================================================================

  {
    id: "ascvd-risk",
    name: "ASCVD Risk Calculator (with CKD Considerations)",
    description: "Estimates 10-year cardiovascular disease risk",
    category: "Cardiovascular Risk",
    inputs: [
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "55", required: true, min: 40, max: 79 },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "race", label: "Race", type: "select", options: [{ value: "Black", label: "African American" }, { value: "White", label: "White/Other" }], required: true },
      { id: "totalCholesterol", label: "Total Cholesterol", type: "number", unit: "mg/dL", placeholder: "200", required: true },
      { id: "hdl", label: "HDL Cholesterol", type: "number", unit: "mg/dL", placeholder: "50", required: true },
      { id: "systolicBP", label: "Systolic Blood Pressure", type: "number", unit: "mmHg", placeholder: "130", required: true },
      { id: "treated", label: "On Blood Pressure Medication", type: "checkbox" },
      { id: "diabetes", label: "Diabetes Mellitus", type: "checkbox" },
      { id: "smoker", label: "Current Smoker", type: "checkbox" },
    ],
    resultLabel: "10-Year ASCVD Risk",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 5) return "Low risk (<5%)";
      if (value < 7.5) return "Borderline risk (5-7.5%) - CKD is risk enhancer";
      if (value < 20) return "Intermediate risk (7.5-20%)";
      return "High risk (>20%)";
    },
    clinicalPearls: [
      "CKD (eGFR <60 or ACR ≥30) = risk enhancer → consider statin even if calculated risk 5-7.5%",
      "Traditional calculators UNDERESTIMATE risk in CKD",
      "CVD = leading cause of death in CKD",
      "Lower thresholds for statin initiation in CKD patients",
    ],
    references: ["Goff DC Jr et al. Circulation. 2014;129(25 Suppl 2):S49-73"],
  },

  {
    id: "statin-intensity",
    name: "Statin Intensity Guide for CKD & Transplant",
    description: "Guides statin selection and dosing in CKD/transplant",
    category: "Cardiovascular Risk",
    inputs: [
      { id: "indication", label: "Clinical Indication", type: "select", options: [
        { value: "primary", label: "Primary prevention (CKD stage 3-4)" },
        { value: "secondary", label: "Secondary prevention (prior ASCVD)" },
        { value: "transplant", label: "Post-transplant" },
        { value: "dialysis", label: "Dialysis patient (secondary prevention only)" },
      ], required: true },
    ],
    resultLabel: "Recommended Statin Intensity",
    resultUnit: "recommendation",
    interpretation: (value) => {
      const recommendations: Record<string, string> = {
        "primary": "Moderate-intensity statin (e.g., atorvastatin 10-20 mg, rosuvastatin 5-10 mg)",
        "secondary": "High-intensity statin (e.g., atorvastatin 40-80 mg, rosuvastatin 20-40 mg)",
        "transplant": "Moderate-intensity statin (atorvastatin 10-20 mg preferred; avoid simvastatin/lovastatin with calcineurin inhibitors)",
        "dialysis": "Continue if already on statin; do NOT initiate for primary prevention (4D, AURORA trials)",
      };
      return recommendations[value] || "Unable to determine";
    },
    clinicalPearls: [
      "Cyclosporine + simvastatin/lovastatin = CONTRAINDICATED (rhabdomyolysis risk)",
      "Preferred post-transplant: atorvastatin, rosuvastatin, pravastatin, fluvastatin",
      "Initiate within 3 months post-transplant (ALERT trial: ↓ cardiac events)",
      "Monitor CK, LFTs at baseline, 6-12 weeks, then annually",
    ],
    references: ["Stone NJ et al. Circulation. 2014;129(25 Suppl 2):S1-S45"],
  },

  // ============================================================================
  // ANTHROPOMETRIC & BODY COMPOSITION
  // ============================================================================

  {
    id: "bmi",
    name: "Body Mass Index (BMI)",
    description: "Calculates BMI from height and weight",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm or inches", placeholder: "170", required: true },
      { id: "heightUnit", label: "Height Unit", type: "select", options: [{ value: "cm", label: "cm" }, { value: "in", label: "inches" }], required: true },
    ],
    resultLabel: "BMI",
    resultUnit: "kg/m²",
    interpretation: (value) => {
      if (value < 18.5) return "Underweight";
      if (value < 25) return "Normal weight";
      if (value < 30) return "Overweight";
      if (value < 35) return "Obese Class I";
      if (value < 40) return "Obese Class II";
      return "Obese Class III (Severe obesity)";
    },
    clinicalPearls: [
      "Simple screening tool for weight status",
      "Does not distinguish muscle from fat",
      "CKD patients: obesity increases CVD risk",
      "Use adjusted body weight for drug dosing in obesity",
    ],
    references: ["WHO BMI Classification"],
  },

  {
    id: "bsa-dubois",
    name: "BSA – Du Bois & Du Bois Formula",
    description: "Calculates body surface area (traditional formula)",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm or inches", placeholder: "170", required: true },
      { id: "heightUnit", label: "Height Unit", type: "select", options: [{ value: "cm", label: "cm" }, { value: "in", label: "inches" }], required: true },
    ],
    resultLabel: "Body Surface Area",
    resultUnit: "m²",
    interpretation: (value) => {
      if (value < 1.5) return "Small BSA - typical for children or small adults";
      if (value < 2.0) return "Average BSA - typical for adults";
      return "Large BSA - typical for large/obese adults";
    },
    clinicalPearls: [
      "eGFR indexed to 1.73 m² BSA (average adult)",
      "Used for drug dosing (chemotherapy, certain antibiotics)",
      "De-indexing eGFR may be needed in extremes of body size",
      "Average adult BSA: 1.7-2.0 m²",
    ],
    references: ["Du Bois D, Du Bois EF. Arch Intern Med. 1916;17(6):863-871"],
  },

  {
    id: "bsa-mosteller",
    name: "Body Surface Area - Mosteller Formula",
    description: "Calculates BSA using simplified Mosteller formula",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm or inches", placeholder: "170", required: true },
      { id: "heightUnit", label: "Height Unit", type: "select", options: [{ value: "cm", label: "cm" }, { value: "in", label: "inches" }], required: true },
    ],
    resultLabel: "Body Surface Area",
    resultUnit: "m²",
    interpretation: (value) => {
      if (value < 1.5) return "Small BSA";
      if (value < 2.0) return "Average BSA";
      return "Large BSA";
    },
    clinicalPearls: [
      "Simpler than Du Bois formula (equivalent accuracy)",
      "Used for drug dosing (chemotherapy, certain antibiotics)",
      "Easier to calculate than Du Bois",
    ],
    references: ["Mosteller RD. N Engl J Med. 1987;317(17):1098"],
  },

  {
    id: "devine-ibw",
    name: "Devine Ideal Body Weight",
    description: "Calculates ideal body weight for height and sex",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "height", label: "Height", type: "number", unit: "cm or inches", placeholder: "170", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "heightUnit", label: "Height Unit", type: "select", options: [{ value: "cm", label: "cm" }, { value: "in", label: "inches" }], required: true },
    ],
    resultLabel: "Ideal Body Weight",
    resultUnit: "kg",
    interpretation: (value) => {
      if (value > 0) return `Ideal body weight: ${value.toFixed(1)} kg`;
      return "Unable to calculate";
    },
    clinicalPearls: [
      "Men: 50 + 2.3 × (height in inches - 60)",
      "Women: 45.5 + 2.3 × (height in inches - 60)",
      "Used for drug dosing in obesity",
      "Reference for calculating adjusted body weight",
    ],
    references: ["Devine BJ. Drug Intell Clin Pharm. 1974;8(7):470-471"],
  },

  {
    id: "lean-body-weight",
    name: "Lean Body Weight (Janmahasatian)",
    description: "Estimates lean body mass for drug dosing",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "weight", label: "Body Weight", type: "number", unit: "kg", placeholder: "70", required: true },
      { id: "height", label: "Height", type: "number", unit: "cm or inches", placeholder: "170", required: true },
      { id: "sex", label: "Sex", type: "select", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], required: true },
      { id: "heightUnit", label: "Height Unit", type: "select", options: [{ value: "cm", label: "cm" }, { value: "in", label: "inches" }], required: true },
    ],
    resultLabel: "Lean Body Weight",
    resultUnit: "kg",
    interpretation: (value) => {
      if (value > 0) return `Lean body weight: ${value.toFixed(1)} kg`;
      return "Unable to calculate";
    },
    clinicalPearls: [
      "More accurate than adjusted body weight for some drugs",
      "Used for aminoglycoside dosing in obesity",
      "Accounts for sex differences in body composition",
    ],
    references: ["Janmahasatian S et al. Clin Pharmacokinet. 2005;44(10):1051-1065"],
  },

  {
    id: "adjusted-body-weight",
    name: "Adjusted Body Weight (for Obese Patients)",
    description: "Calculates adjusted weight for drug dosing in obesity",
    category: "Anthropometric & Body Composition",
    inputs: [
      { id: "actualWeight", label: "Actual Body Weight", type: "number", unit: "kg", placeholder: "120", required: true },
      { id: "idealWeight", label: "Ideal Body Weight", type: "number", unit: "kg", placeholder: "73", required: true },
    ],
    resultLabel: "Adjusted Body Weight",
    resultUnit: "kg",
    interpretation: (value) => {
      if (value > 0) return `Adjusted BW: ${value.toFixed(1)} kg - use for aminoglycosides`;
      return "Unable to calculate";
    },
    clinicalPearls: [
      "Formula: Adjusted BW = IBW + 0.4 × (Actual BW - IBW)",
      "Used for aminoglycoside dosing in obesity",
      "Assumes 40% of excess weight is metabolically active",
      "Vancomycin: controversial (some use actual BW, some adjusted)",
    ],
    references: ["Pai MP, Paloucek FP. Ann Pharmacother. 2000;34(9):1066-1069"],
  },

  // ============================================================================
  // CKD-MINERAL BONE DISEASE
  // ============================================================================

  {
    id: "ca-pho-product",
    name: "Calcium-Phosphate Product (CKD-MBD)",
    description: "Calculates risk of vascular calcification",
    category: "CKD-Mineral Bone Disease",
    inputs: [
      { id: "calcium", label: "Serum Calcium", type: "number", unit: "mg/dL or mmol/L", placeholder: "9", required: true },
      { id: "phosphate", label: "Serum Phosphate", type: "number", unit: "mg/dL or mmol/L", placeholder: "5", required: true },
      { id: "calciumUnit", label: "Calcium Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
      { id: "phosphateUnit", label: "Phosphate Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
    ],
    resultLabel: "Ca × PO₄ Product",
    resultUnit: "mg²/dL²",
    interpretation: (value) => {
      if (value < 55) return "Target range - low vascular calcification risk";
      if (value < 70) return "Caution zone - risk of vascular calcification";
      return "High risk - immediate intervention needed (phosphate binders, dialysis, calcimimetics)";
    },
    clinicalPearls: [
      "Target: <55 mg²/dL²",
      "High product → metastatic calcification (vessels, soft tissues, heart valves)",
      "Associated with cardiovascular mortality in CKD and dialysis",
      "Management: phosphate binders, dietary restriction, dialysis adequacy, calcimimetics",
    ],
    references: ["KDIGO 2017 Clinical Practice Guideline Update for CKD-MBD"],
  },

  // ============================================================================
  // SYSTEMIC DISEASES & SCORES
  // ============================================================================

  {
    id: "sledai-2k",
    name: "SLEDAI-2K Disease-Activity Score",
    description: "Measures SLE disease activity",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "seizures", label: "Seizures", type: "checkbox" },
      { id: "psychosis", label: "Psychosis", type: "checkbox" },
      { id: "organicBrainSyndrome", label: "Organic Brain Syndrome", type: "checkbox" },
      { id: "visualDisorder", label: "Visual Disorder", type: "checkbox" },
      { id: "cranialNerveDisorder", label: "Cranial Nerve Disorder", type: "checkbox" },
      { id: "lupusHeadache", label: "Lupus Headache", type: "checkbox" },
      { id: "cerebrovasitisAccident", label: "Cerebrovascular Accident", type: "checkbox" },
      { id: "vasculitis", label: "Vasculitis", type: "checkbox" },
      { id: "arthritis", label: "Arthritis", type: "checkbox" },
      { id: "myositis", label: "Myositis", type: "checkbox" },
      { id: "urinaryCasts", label: "Urinary Casts", type: "checkbox" },
      { id: "proteinuria", label: "Proteinuria (>0.5 g/day)", type: "checkbox" },
      { id: "hematuria", label: "Hematuria", type: "checkbox" },
      { id: "pyuria", label: "Pyuria", type: "checkbox" },
      { id: "rash", label: "Rash", type: "checkbox" },
      { id: "alopecia", label: "Alopecia", type: "checkbox" },
      { id: "mucousalUlcers", label: "Mucosal Ulcers", type: "checkbox" },
      { id: "pleuritis", label: "Pleuritis", type: "checkbox" },
      { id: "pericarditis", label: "Pericarditis", type: "checkbox" },
      { id: "lowComplement", label: "Low Complement (C3 or C4)", type: "checkbox" },
      { id: "elevatedDNA", label: "Elevated Anti-DNA Antibodies", type: "checkbox" },
    ],
    resultLabel: "SLEDAI-2K Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value === 0) return "Remission - no active disease";
      if (value <= 4) return "Mild disease activity";
      if (value <= 8) return "Moderate disease activity";
      if (value <= 16) return "High disease activity";
      return "Very high disease activity - requires aggressive treatment";
    },
    clinicalPearls: [
      "Measures current SLE disease activity",
      "Useful for monitoring treatment response",
      "Guides immunosuppression intensity",
      "Serial measurements track disease course",
    ],
    references: ["Gladman DD et al. Lupus. 2011;20(5):453-462"],
  },

  {
    id: "slicc-2012",
    name: "SLICC 2012 SLE Classification Criteria",
    description: "Classifies patients as having SLE",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "acuteRash", label: "Acute Cutaneous Lupus (malar, bullous, TEN-like)", type: "checkbox" },
      { id: "chronicRash", label: "Chronic Cutaneous Lupus (DLE, ACLE)", type: "checkbox" },
      { id: "oralUlcers", label: "Oral Ulcers", type: "checkbox" },
      { id: "alopecia", label: "Alopecia", type: "checkbox" },
      { id: "photosensitivity", label: "Photosensitivity", type: "checkbox" },
      { id: "arthritis", label: "Arthritis (≥2 joints)", type: "checkbox" },
      { id: "serositis", label: "Serositis (pleuritis or pericarditis)", type: "checkbox" },
      { id: "renal", label: "Renal (proteinuria >0.5 g/day or cellular casts)", type: "checkbox" },
      { id: "psychosis", label: "Psychosis", type: "checkbox" },
      { id: "seizures", label: "Seizures", type: "checkbox" },
      { id: "hemolytic", label: "Hemolytic Anemia", type: "checkbox" },
      { id: "leukopenia", label: "Leukopenia (<4000/μL)", type: "checkbox" },
      { id: "thrombocytopenia", label: "Thrombocytopenia (<100,000/μL)", type: "checkbox" },
      { id: "ana", label: "ANA (≥1:80)", type: "checkbox" },
      { id: "antiDsDna", label: "Anti-dsDNA Antibodies", type: "checkbox" },
      { id: "antiSmRnp", label: "Anti-Sm or Anti-RNP Antibodies", type: "checkbox" },
      { id: "antiRoSsa", label: "Anti-Ro/SSA Antibodies", type: "checkbox" },
      { id: "antiLaSSb", label: "Anti-La/SSB Antibodies", type: "checkbox" },
      { id: "antiC1q", label: "Anti-C1q Antibodies", type: "checkbox" },
      { id: "directCoombs", label: "Direct Coombs Test (without hemolytic anemia)", type: "checkbox" },
    ],
    resultLabel: "SLICC 2012 Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value >= 4) return "Meets SLICC 2012 SLE classification criteria";
      return "Does not meet SLICC 2012 SLE classification criteria";
    },
    clinicalPearls: [
      "Classification criteria (not diagnostic criteria)",
      "Requires ≥4 points from clinical and immunologic criteria",
      "At least 1 clinical criterion required",
      "Updated from 1997 ACR criteria",
    ],
    references: ["Petri M et al. Arthritis Care Res (Hoboken). 2012;64(8):1246-1255"],
  },

  {
    id: "frail-scale",
    name: "FRAIL Scale",
    description: "Assesses frailty in older adults",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "fatigue", label: "Fatigue", type: "checkbox" },
      { id: "resistance", label: "Resistance (difficulty climbing stairs)", type: "checkbox" },
      { id: "ambulation", label: "Ambulation (difficulty walking)", type: "checkbox" },
      { id: "illness", label: "Illness (>5 diseases)", type: "checkbox" },
      { id: "lossOfWeight", label: "Loss of Weight (>5% in past year)", type: "checkbox" },
    ],
    resultLabel: "FRAIL Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value === 0) return "Not frail";
      if (value === 1) return "Pre-frail";
      if (value >= 2) return "Frail - higher mortality and morbidity risk";
      return "Unable to determine";
    },
    clinicalPearls: [
      "Simple 5-item screening tool",
      "Identifies frail older adults at risk",
      "Guides treatment intensity and goals of care",
      "Useful in transplant candidate evaluation",
    ],
    references: ["Fried LP et al. J Gerontol A Biol Sci Med Sci. 2001;56(3):M146-M156"],
  },

  {
    id: "prisma-7",
    name: "PRISMA-7 Frailty Score",
    description: "Brief frailty screening tool",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "age", label: "Age ≥85 years", type: "checkbox" },
      { id: "female", label: "Female", type: "checkbox" },
      { id: "generalHealth", label: "General Health Fair or Poor", type: "checkbox" },
      { id: "limitation", label: "Limitation in Activities", type: "checkbox" },
      { id: "falls", label: "Falls in Past Year", type: "checkbox" },
      { id: "memory", label: "Memory Problems", type: "checkbox" },
      { id: "helpNeeded", label: "Help Needed for Medications/Finances", type: "checkbox" },
    ],
    resultLabel: "PRISMA-7 Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value <= 1) return "Not frail";
      if (value === 2) return "Possibly frail";
      if (value >= 3) return "Frail - higher risk of adverse outcomes";
      return "Unable to determine";
    },
    clinicalPearls: [
      "7-item screening questionnaire",
      "Quick assessment in clinical practice",
      "Identifies frail older adults needing further evaluation",
      "Useful in transplant and dialysis settings",
    ],
    references: ["Hébert R et al. J Clin Epidemiol. 2003;56(12):1236-1242"],
  },

  {
    id: "curb-65",
    name: "CURB-65 Pneumonia Severity Score",
    description: "Predicts pneumonia severity and mortality",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "confusion", label: "Confusion (new onset)", type: "checkbox" },
      { id: "urineaNitrogen", label: "Urea Nitrogen (BUN)", type: "number", unit: "mg/dL or mmol/L", placeholder: "20", required: true },
      { id: "respiratoryRate", label: "Respiratory Rate", type: "number", unit: "breaths/min", placeholder: "20", required: true },
      { id: "bloodPressureSystolic", label: "Systolic Blood Pressure", type: "number", unit: "mmHg", placeholder: "110", required: true },
      { id: "bloodPressureDiastolic", label: "Diastolic Blood Pressure", type: "number", unit: "mmHg", placeholder: "70", required: true },
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "65", required: true },
      { id: "bunUnit", label: "BUN Unit", type: "select", options: [{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }], required: true },
    ],
    resultLabel: "CURB-65 Score",
    resultUnit: "points",
    interpretation: (value) => {
      if (value === 0) return "Low risk (0.7% mortality) - outpatient treatment";
      if (value === 1) return "Low-intermediate risk (2.1% mortality) - consider hospitalization";
      if (value === 2) return "Intermediate risk (9.2% mortality) - hospitalize";
      if (value === 3) return "High risk (14.5% mortality) - hospitalize, consider ICU";
      return "Very high risk (>40% mortality) - ICU admission";
    },
    clinicalPearls: [
      "Guides hospitalization and ICU admission decisions",
      "Simple bedside assessment",
      "Useful in CKD patients with infection",
      "BUN >7 mmol/L (>20 mg/dL) = 1 point",
    ],
    references: ["Lim WS et al. Thorax. 2003;58(5):377-382"],
  },

  {
    id: "roks",
    name: "ROKS (Recurrence Of Kidney Stone) Nomogram",
    description: "Predicts kidney stone recurrence risk",
    category: "Systemic Diseases & Scores",
    inputs: [
      { id: "age", label: "Age", type: "number", unit: "years", placeholder: "45", required: true },
      { id: "bmi", label: "BMI", type: "number", unit: "kg/m²", placeholder: "28", required: true },
      { id: "maleGender", label: "Male Gender", type: "checkbox" },
      { id: "previousStone", label: "Previous Kidney Stone", type: "checkbox" },
      { id: "familyHistory", label: "Family History of Kidney Stones", type: "checkbox" },
    ],
    resultLabel: "Recurrence Risk",
    resultUnit: "%",
    interpretation: (value) => {
      if (value < 20) return "Low recurrence risk";
      if (value < 50) return "Moderate recurrence risk";
      return "High recurrence risk - aggressive prevention recommended";
    },
    clinicalPearls: [
      "Predicts 5-year stone recurrence",
      "Guides prevention intensity",
      "Male gender, previous stone, family history increase risk",
      "Obesity increases recurrence risk",
    ],
    references: ["Siener R, Hesse A. Urol Res. 2003;31(3):169-173"],
  },
];

export function getCalculatorsByCategory(category: string): Calculator[] {
  return calculators.filter((calc) => calc.category === category);
}

export function getCategories(): string[] {
  const categories = new Set(calculators.map((calc) => calc.category));
  return Array.from(categories).sort();
}

export function getCalculatorById(id: string): Calculator | undefined {
  return calculators.find((calc) => calc.id === id);
}
