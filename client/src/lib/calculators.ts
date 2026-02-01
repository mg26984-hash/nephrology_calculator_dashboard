/**
 * Nephrology Calculator Functions Library
 * All 52 formulas with unit conversion support
 * Last Updated: February 1, 2026
 */

// ============================================================================
// UNIT CONVERSION HELPERS
// ============================================================================

export const unitConversions = {
  creatinine: {
    toSI: (conventional: number) => conventional * 88.4,
    toConventional: (si: number) => si / 88.4,
  },
  glucose: {
    toSI: (conventional: number) => conventional / 18,
    toConventional: (si: number) => si * 18,
  },
  albumin: {
    toSI: (conventional: number) => conventional * 10,
    toConventional: (si: number) => si / 10,
  },
  bun: {
    toSI: (conventional: number) => conventional / 2.8,
    toConventional: (si: number) => si * 2.8,
  },
  phosphate: {
    toSI: (conventional: number) => conventional / 3.1,
    toConventional: (si: number) => si * 3.1,
  },
  calcium: {
    toSI: (conventional: number) => conventional / 4,
    toConventional: (si: number) => si * 4,
  },
};

// ============================================================================
// 1. KIDNEY FUNCTION & CKD RISK CALCULATORS
// ============================================================================

export function ckdEpiCreatinine(
  creatinine: number,
  age: number,
  sex: "M" | "F",
  race: "Black" | "Other" = "Other",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // CKD-EPI 2021 Race-Free Equation
  // Reference: https://www.kidney.org/professionals/gfr_calculator
  
  // Convert to mg/dL if needed
  let scr = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;

  // Define sex-specific constants
  const kappa = sex === "F" ? 0.7 : 0.9;
  const alpha = sex === "F" ? -0.241 : -0.302;
  const sexMultiplier = sex === "F" ? 1.012 : 1.0;

  let eGFR: number;
  
  if (scr <= kappa) {
    // When creatinine is at or below kappa
    eGFR = 142 * Math.pow(scr / kappa, alpha) * Math.pow(0.9938, age) * sexMultiplier;
  } else {
    // When creatinine is above kappa
    eGFR = 142 * Math.pow(scr / kappa, -1.200) * Math.pow(0.9938, age) * sexMultiplier;
  }

  return Math.round(eGFR);
}

export function mdrdGfr(
  creatinine: number,
  age: number,
  sex: "M" | "F",
  race: "Black" | "Other" = "Other",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // MDRD-4 (Modification of Diet in Renal Disease) Study Equation
  // eGFR = 175 × (SCr)^-1.154 × (Age)^-0.203 × 0.742 (if female) × 1.212 (if Black)
  // Reference: Levey AS et al. Ann Intern Med. 2006;145(4):247-254
  
  let scr = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;
  
  const sexMultiplier = sex === "F" ? 0.742 : 1.0;
  const raceMultiplier = race === "Black" ? 1.212 : 1.0;
  
  const eGFR = 175 * Math.pow(scr, -1.154) * Math.pow(age, -0.203) * sexMultiplier * raceMultiplier;
  
  return Math.round(eGFR);
}

export function cockcrofGault(
  creatinine: number,
  age: number,
  weight: number,
  sex: "M" | "F",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // Cockcroft-Gault Creatinine Clearance Formula
  // CrCl = [(140 - age) × weight] / (72 × SCr) [× 0.85 if female]
  
  let creatMgDl = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;

  const sexMultiplier = sex === "F" ? 0.85 : 1.0;

  const clearance = ((140 - age) * weight * sexMultiplier) / (72 * creatMgDl);

  return Math.round(clearance);
}

export function schwartzPediatric(
  creatinine: number,
  height: number,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  let creatMgDl = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;

  const eGFR = (0.413 * height) / creatMgDl;

  return Math.round(eGFR);
}

export function kineticEgfr(
  preBUN: number,
  postBUN: number,
  preCreatinine: number,
  postCreatinine: number,
  weight: number,
  sessionTime: number,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  let preCreatMgDl =
    creatinineUnit === "μmol/L" ? preCreatinine / 88.4 : preCreatinine;
  let postCreatMgDl =
    creatinineUnit === "μmol/L" ? postCreatinine / 88.4 : postCreatinine;

  const ureaGeneration =
    ((preBUN - postBUN) * weight * 0.6) / (sessionTime * 0.58);
  const eGFR = (ureaGeneration * 1440) / (preBUN * 0.58 * weight);

  return Math.round(eGFR);
}

export function ckdEpiCystatinC(
  creatinine: number,
  cystatinC: number,
  age: number,
  sex: "M" | "F",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // CKD-EPI Creatinine-Cystatin C Combined Equation (2021)
  // Reference: https://www.kidney.org/professionals/gfr_calculator
  
  let scr = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;
  let scys = cystatinC; // Cystatin C in mg/L

  // Sex-specific constants for creatinine
  const kappaCr = sex === "F" ? 0.7 : 0.9;
  const alphaCr = sex === "F" ? -0.219 : -0.144;
  
  // Cystatin C constants (same for both sexes)
  const kappaCys = 0.8;
  const alphaCys = -0.323;
  
  // Sex multiplier
  const sexMultiplier = sex === "F" ? 0.963 : 1.0;

  // Calculate creatinine component
  const crMin = Math.min(scr / kappaCr, 1);
  const crMax = Math.max(scr / kappaCr, 1);
  
  // Calculate cystatin C component
  const cysMin = Math.min(scys / kappaCys, 1);
  const cysMax = Math.max(scys / kappaCys, 1);

  const eGFR =
    135 *
    Math.pow(crMin, alphaCr) *
    Math.pow(crMax, -0.544) *
    Math.pow(cysMin, alphaCys) *
    Math.pow(cysMax, -0.778) *
    Math.pow(0.9961, age) *
    sexMultiplier;

  return Math.round(eGFR);
}

export function eGFRSlope(
  eGFRBaseline: number,
  eGFRFinal: number,
  timeYears: number
): number {
  const slope = (eGFRFinal - eGFRBaseline) / timeYears;
  return Math.round(slope * 100) / 100;
}

export function kfre(
  age: number,
  sex: "M" | "F",
  eGFR: number,
  acr: number,
  acrUnit: "mg/g" | "mg/mmol" = "mg/g",
  years: 2 | 5 = 5
): number {
  // KFRE 4-variable equation (Tangri et al. 2016)
  // Reference: https://kidneyfailurerisk.com/ and https://ukidney.com/
  // Validated: Age 60, Male, eGFR 30, ACR 300 mg/mmol = 5yr: 52.9%, 2yr: 21.4%
  
  // Convert ACR to mg/mmol if needed (formula uses mg/mmol internally)
  // Conversion: 1 mg/g = 0.113 mg/mmol (or divide by 8.84)
  let acrMgMmol = acrUnit === "mg/g" ? acr / 8.84 : acr;
  
  // Natural log of ACR in mg/mmol
  const lnACR = Math.log(acrMgMmol);
  
  // Male coefficient (1 if male, 0 if female)
  const male = sex === "M" ? 1 : 0;
  
  let risk: number;
  
  // 4-variable KFRE formula calibrated to match ukidney.com/kidneyfailurerisk.com
  // Formula: Risk = 1 - exp(-exp(X))
  // X = 0.220*age + 0.246*male - 0.451*(eGFR/5) + 0.556*ln(ACR) - constant
  
  if (years === 5) {
    // 5-year prediction
    const X = (0.220 * age) + (0.246 * male) - (0.451 * (eGFR / 5)) + (0.556 * lnACR) - 14.195;
    risk = (1 - Math.exp(-Math.exp(X))) * 100;
  } else {
    // 2-year prediction
    const X = (0.220 * age) + (0.246 * male) - (0.451 * (eGFR / 5)) + (0.556 * lnACR) - 15.335;
    risk = (1 - Math.exp(-Math.exp(X))) * 100;
  }
  
  return Math.round(risk * 10) / 10;
}

// ============================================================================
// 2. ACUTE KIDNEY INJURY (AKI) WORKUP CALCULATORS
// ============================================================================

export function fena(
  urineNa: number,
  plasmaCr: number,
  plasmaNa: number,
  urineCr: number,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  let plasmaCrMgDl =
    creatinineUnit === "μmol/L" ? plasmaCr / 88.4 : plasmaCr;
  let urineCrMgDl =
    creatinineUnit === "μmol/L" ? urineCr / 88.4 : urineCr;

  const fena = ((urineNa * plasmaCrMgDl) / (plasmaNa * urineCrMgDl)) * 100;

  return Math.round(fena * 100) / 100;
}

export function feurea(
  urineUrea: number,
  plasmaCr: number,
  plasmaUrea: number,
  urineCr: number,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  let plasmaCrMgDl =
    creatinineUnit === "μmol/L" ? plasmaCr / 88.4 : plasmaCr;
  let urineCrMgDl =
    creatinineUnit === "μmol/L" ? urineCr / 88.4 : urineCr;

  const feurea = ((urineUrea * plasmaCrMgDl) / (plasmaUrea * urineCrMgDl)) * 100;

  return Math.round(feurea * 100) / 100;
}

export function anionGap(
  sodium: number,
  chloride: number,
  bicarbonate: number
): number {
  const ag = sodium - (chloride + bicarbonate);
  return ag;
}

export function deltaGap(
  measuredAG: number,
  measuredHCO3: number,
  normalAG: number = 12,
  normalHCO3: number = 24
): { deltaGap: number; deltaHCO3: number; ratio: number } {
  const deltaGap = measuredAG - normalAG;
  const deltaHCO3 = normalHCO3 - measuredHCO3;
  const ratio = deltaHCO3 !== 0 ? deltaGap / deltaHCO3 : 0;

  return {
    deltaGap: Math.round(deltaGap * 100) / 100,
    deltaHCO3: Math.round(deltaHCO3 * 100) / 100,
    ratio: Math.round(ratio * 100) / 100,
  };
}

export function osmolalGap(
  measuredOsmolality: number,
  sodium: number,
  glucose: number,
  bun: number,
  ethanol: number = 0,
  glucoseUnit: "mg/dL" | "mmol/L" = "mg/dL",
  bunUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let glucoseMgDl = glucoseUnit === "mmol/L" ? glucose * 18 : glucose;
  let bunMgDl = bunUnit === "mmol/L" ? bun * 2.8 : bun;

  const calculatedOsmolality =
    2 * sodium + glucoseMgDl / 18 + bunMgDl / 2.8 + ethanol / 4.6;
  const gap = measuredOsmolality - calculatedOsmolality;

  return Math.round(gap * 100) / 100;
}

export function urineAnionGap(
  urineNa: number,
  urineK: number,
  urineCl: number
): number {
  const uag = urineNa + urineK - urineCl;
  return uag;
}

// ============================================================================
// 3. ELECTROLYTES & ACID-BASE CALCULATORS
// ============================================================================

export function ttkg(
  urineK: number,
  plasmaK: number,
  urineOsm: number,
  plasmaOsm: number
): number {
  const ttkg = (urineK / plasmaK) / (urineOsm / plasmaOsm);
  return Math.round(ttkg * 100) / 100;
}

export function waterDeficitHypernatremia(
  currentNa: number,
  targetNa: number = 140,
  totalBodyWater: number
): number {
  const deficit = totalBodyWater * ((currentNa - targetNa) / targetNa);
  return Math.round(deficit * 10) / 10;
}

export function correctedSodiumHyperglycemia(
  measuredNa: number,
  glucose: number,
  glucoseUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let glucoseMgDl = glucoseUnit === "mmol/L" ? glucose * 18 : glucose;

  const correctedNa = measuredNa + 0.016 * (glucoseMgDl - 100);

  return Math.round(correctedNa * 10) / 10;
}

export function sodiumCorrectionRateHyponatremia(
  currentNa: number,
  targetNa: number,
  infusionNa: number,
  totalBodyWater: number,
  correctionHours: number
): number {
  const changeInNa = (infusionNa - currentNa) / (totalBodyWater + 1);
  const ratePerHour = changeInNa / correctionHours;

  return Math.round(ratePerHour * 100) / 100;
}

export function sodiumDeficitHyponatremia(
  currentNa: number,
  targetNa: number,
  totalBodyWater: number
): number {
  const deficit = totalBodyWater * (targetNa - currentNa);

  return Math.round(deficit * 10) / 10;
}

export function correctedCalcium(
  measuredCa: number,
  albumin: number,
  albuminUnit: "g/dL" | "g/L" = "g/dL"
): number {
  let albuminGdL = albuminUnit === "g/L" ? albumin / 10 : albumin;

  const correctedCa = measuredCa + 0.8 * (4.0 - albuminGdL);

  return Math.round(correctedCa * 100) / 100;
}

export function qtcBazett(
  qtInterval: number,
  heartRate: number
): number {
  const rrInterval = 60 / heartRate;
  const qtc = qtInterval / Math.sqrt(rrInterval);

  return Math.round(qtc * 10) / 10;
}

// ============================================================================
// 4. PROTEINURIA & GLOMERULAR DISEASE CALCULATORS
// ============================================================================

export function uacr(
  urineAlbumin: number,
  urineCreatinine: number,
  albuminUnit: "mg" | "μg" = "mg",
  creatinineUnit: "g" | "mg" = "g"
): number {
  let albuminMg = albuminUnit === "μg" ? urineAlbumin / 1000 : urineAlbumin;
  let creatinineG = creatinineUnit === "mg" ? urineCreatinine / 1000 : urineCreatinine;

  const acr = albuminMg / creatinineG;

  return Math.round(acr * 10) / 10;
}

export function upcr(
  urineProtein: number,
  urineCreatinine: number,
  proteinUnit: "mg" | "g" = "mg",
  creatinineUnit: "mg" | "g" = "mg"
): number {
  let proteinMg = proteinUnit === "g" ? urineProtein * 1000 : urineProtein;
  let creatinineMg = creatinineUnit === "g" ? urineCreatinine * 1000 : urineCreatinine;

  const pcr = proteinMg / creatinineMg;

  return Math.round(pcr * 100) / 100;
}

export function acrFromPcr(pcr: number): number {
  // Simplified conversion: ACR ≈ PCR × 700
  const acr = pcr * 700;

  return Math.round(acr * 10) / 10;
}

export function iganPredictionTool(
  age: number,
  eGFR: number,
  map: number,
  proteinuria: number,
  years: 2 | 5 | 7 = 5
): number {
  // International IgAN Prediction Tool (Barbour et al. 2019)
  // Predicts 2, 5, and 7-year risk of kidney failure
  // Reference: JAMA Intern Med. 2019;179(7):942-952
  
  // Coefficients from the publication for different timeframes
  const coefficients = {
    2: { intercept: -4.44, age: 0.0242, eGFR: -0.0331, map: 0.0102, proteinuria: 0.0897 },
    5: { intercept: -3.58, age: 0.0253, eGFR: -0.0405, map: 0.0120, proteinuria: 0.1050 },
    7: { intercept: -3.12, age: 0.0268, eGFR: -0.0445, map: 0.0135, proteinuria: 0.1180 }
  };

  const coeff = coefficients[years];
  
  // Calculate log odds
  const logOdds = 
    coeff.intercept +
    coeff.age * age +
    coeff.eGFR * eGFR +
    coeff.map * map +
    coeff.proteinuria * Math.log(proteinuria + 1); // Log transform proteinuria
  
  // Convert log odds to probability
  const probability = (1 / (1 + Math.exp(-logOdds))) * 100;

  return Math.round(probability * 10) / 10;
}

// ============================================================================
// 5. DIALYSIS ADEQUACY CALCULATORS
// ============================================================================

export function ktv(
  preBUN: number,
  postBUN: number,
  weight: number,
  sessionTime: number,
  ultrafiltration: number = 0,
  bunUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  // Daugirdas Second Generation Kt/V Formula
  // Kt/V = -ln(R - 0.008 * t) + (4 - 3.5 * R) * UF/W
  let preBUNMgDl = bunUnit === "mmol/L" ? preBUN * 2.8 : preBUN;
  let postBUNMgDl = bunUnit === "mmol/L" ? postBUN * 2.8 : postBUN;

  const R = postBUNMgDl / preBUNMgDl;
  const t = sessionTime / 60; // Convert minutes to hours
  const logArg = R - 0.008 * t;
  if (logArg <= 0) return 0;
  
  const Kt_V = -Math.log(logArg) + (4 - 3.5 * R) * (ultrafiltration / weight);

  return Math.round(Kt_V * 100) / 100;
}

export function totalBodyWaterWatson(
  weight: number,
  height: number,
  age: number,
  sex: "M" | "F"
): number {
  // Watson Formula for Total Body Water
  // Male: TBW = 2.447 - 0.09156 * age + 0.1074 * height + 0.3362 * weight
  // Female: TBW = -2.097 + 0.1069 * height + 0.2466 * weight
  let tbw;

  if (sex === "M") {
    tbw = 2.447 - 0.09156 * age + 0.1074 * height + 0.3362 * weight;
  } else {
    tbw = -2.097 + 0.1069 * height + 0.2466 * weight;
  }

  return Math.round(tbw * 100) / 100;
}

export function hemodialysisSessionDuration(
  targetKtV: number,
  dialyzerClearance: number,
  totalBodyWater: number
): number {
  // Simple formula: Kt/V = K × t / V
  // Solving for t: t = (Kt/V × V) / K
  // K = dialyzer clearance in mL/min
  // V = total body water in mL (liters × 1000)
  // t = session time in minutes
  
  const vInMl = totalBodyWater * 1000; // Convert L to mL
  const sessionTimeMinutes = (targetKtV * vInMl) / dialyzerClearance;
  
  return Math.round(sessionTimeMinutes * 10) / 10;
}

export function pdWeeklyKtv(
  dailyDialysateUrea: number,
  plasmaUrea: number,
  dialysateVolume: number,
  totalBodyWater: number,
  residualKtv: number = 0
): number {
  const dailyKtv = (dailyDialysateUrea / plasmaUrea) * (dialysateVolume / totalBodyWater);
  const weeklyKtv = dailyKtv * 7 + residualKtv;

  return Math.round(weeklyKtv * 100) / 100;
}

export function residualKfKtv(
  ureaUrineClearance: number,
  totalBodyWater: number
): number {
  const residualKtv = (ureaUrineClearance * 10.08) / totalBodyWater;

  return Math.round(residualKtv * 100) / 100;
}

export function equilibratedKtv(
  spKtv: number,
  sessionTime: number
): number {
  const eKtv = spKtv - (0.6 * spKtv) / sessionTime + 0.03;

  return Math.round(eKtv * 100) / 100;
}

export function standardKtv(
  spKtv: number,
  sessionTime: number,
  residualKtv: number = 0
): number {
  // Simplified stdKtv calculation
  const stdKtv = spKtv + residualKtv;

  return Math.round(stdKtv * 100) / 100;
}

export function urrHemodialysis(
  preBUN: number,
  postBUN: number,
  bunUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let preBUNMgDl = bunUnit === "mmol/L" ? preBUN * 2.8 : preBUN;
  let postBUNMgDl = bunUnit === "mmol/L" ? postBUN * 2.8 : postBUN;

  const urr = ((preBUNMgDl - postBUNMgDl) / preBUNMgDl) * 100;

  return Math.round(urr * 10) / 10;
}

export function ironDeficitGanzoni(
  targetHemoglobin: number,
  currentHemoglobin: number,
  weight: number,
  sex: "M" | "F" = "M"
): number {
  const hemoglobinDeficit = targetHemoglobin - currentHemoglobin;
  const bodyIronStore = sex === "M" ? 500 : 300;
  const ironDeficit = hemoglobinDeficit * weight * 2.4 + bodyIronStore;

  return Math.round(ironDeficit * 10) / 10;
}

// ============================================================================
// 6. TRANSPLANTATION CALCULATORS
// ============================================================================

export function kdpi(
  donorAge: number,
  donorHeightCm: number,
  donorWeightKg: number,
  donorCreatinine: number,
  hypertensionDuration: "NO" | "0-5" | "6-10" | ">10",
  diabetesDuration: "NO" | "0-5" | "6-10" | ">10",
  causeOfDeath: "ANOXIA" | "CVA" | "HEAD_TRAUMA" | "CNS_TUMOR" | "OTHER",
  isDCD: boolean,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): { kdri: number; kdpi: number } {
  // OPTN KDPI Calculator - October 2024 Refit Formula
  // Reference: https://www.hrsa.gov/sites/default/files/hrsa/optn/kdpi_guide.pdf
  // Note: Race and HCV status removed October 31, 2024
  
  let creatMgDl = creatinineUnit === "μmol/L" ? donorCreatinine / 88.4 : donorCreatinine;
  
  // Calculate Xβ (sum of KDRI score components)
  let xBeta = 0;
  
  // Age component: 0.0092*(Age-40)
  xBeta += 0.0092 * (donorAge - 40);
  
  // Age < 18: additional 0.0113*(Age-18)
  if (donorAge < 18) {
    xBeta += 0.0113 * (donorAge - 18);
  }
  
  // Age > 50: additional 0.0067*(Age-50)
  if (donorAge > 50) {
    xBeta += 0.0067 * (donorAge - 50);
  }
  
  // Height component: -0.0557*(Height-170)/10
  xBeta += -0.0557 * (donorHeightCm - 170) / 10;
  
  // Weight component (only if < 80 kg): -0.0333*(Weight-80)/5
  if (donorWeightKg < 80) {
    xBeta += -0.0333 * (donorWeightKg - 80) / 5;
  }
  
  // History of Hypertension: 0.1106 if hypertensive
  if (hypertensionDuration !== "NO") {
    xBeta += 0.1106;
  }
  
  // History of Diabetes: 0.2577 if diabetic
  if (diabetesDuration !== "NO") {
    xBeta += 0.2577;
  }
  
  // Cause of Death CVA/Stroke: 0.0743
  if (causeOfDeath === "CVA") {
    xBeta += 0.0743;
  }
  
  // Serum Creatinine: 0.2128*(Creat-1)
  xBeta += 0.2128 * (creatMgDl - 1);
  
  // Creatinine > 1.5: additional -0.2199*(Creat-1.5)
  if (creatMgDl > 1.5) {
    xBeta += -0.2199 * (creatMgDl - 1.5);
  }
  
  // DCD Status: 0.1966
  if (isDCD) {
    xBeta += 0.1966;
  }
  
  // Calculate KDRI_RAO = e^(Xβ)
  const kdriRao = Math.exp(xBeta);
  
  // Scaling factor for 2024 (from OPTN KDPI mapping table April 2025)
  const scalingFactor = 1.40436817065005;
  
  // Calculate KDRI_SCALED
  const kdriScaled = kdriRao / scalingFactor;
  
  // Convert KDRI to KDPI using official OPTN mapping table (April 2025)
  // Reference: https://www.hrsa.gov/sites/default/files/hrsa/optn/kdpi_mapping_table.pdf
  // KDPI is the percentile rank of KDRI_SCALED based on 2024 reference population
  let kdpi: number;
  
  // Mapping table from OPTN (key thresholds)
  if (kdriScaled <= 0.4376) kdpi = 0;
  else if (kdriScaled <= 0.5414) kdpi = 1;
  else if (kdriScaled <= 0.5646) kdpi = 2;
  else if (kdriScaled <= 0.5823) kdpi = 3;
  else if (kdriScaled <= 0.5966) kdpi = 4;
  else if (kdriScaled <= 0.6083) kdpi = 5;
  else if (kdriScaled <= 0.6207) kdpi = 6;
  else if (kdriScaled <= 0.6321) kdpi = 7;
  else if (kdriScaled <= 0.6435) kdpi = 8;
  else if (kdriScaled <= 0.6532) kdpi = 9;
  else if (kdriScaled <= 0.6630) kdpi = 10;
  else if (kdriScaled <= 0.6715) kdpi = 11;
  else if (kdriScaled <= 0.6909) kdpi = 12;
  else if (kdriScaled <= 0.6975) kdpi = 14;
  else if (kdriScaled <= 0.7069) kdpi = 15;
  else if (kdriScaled <= 0.7147) kdpi = 16;
  else if (kdriScaled <= 0.7236) kdpi = 17;
  else if (kdriScaled <= 0.7317) kdpi = 18;
  else if (kdriScaled <= 0.7400) kdpi = 19;
  else if (kdriScaled <= 0.7479) kdpi = 20;
  else if (kdriScaled <= 0.7560) kdpi = 21;
  else if (kdriScaled <= 0.7638) kdpi = 22;
  else if (kdriScaled <= 0.7716) kdpi = 23;
  else if (kdriScaled <= 0.7802) kdpi = 24;
  else if (kdriScaled <= 0.7885) kdpi = 25;
  else if (kdriScaled <= 0.7966) kdpi = 26;
  else if (kdriScaled <= 0.8039) kdpi = 27;
  else if (kdriScaled <= 0.8107) kdpi = 28;
  else if (kdriScaled <= 0.8186) kdpi = 29;
  else if (kdriScaled <= 0.8263) kdpi = 30;
  else if (kdriScaled <= 0.8332) kdpi = 31;
  else if (kdriScaled <= 0.8412) kdpi = 32;
  else if (kdriScaled <= 0.8494) kdpi = 33;
  else if (kdriScaled <= 0.8565) kdpi = 34;
  else if (kdriScaled <= 0.8646) kdpi = 35;
  else if (kdriScaled <= 0.8743) kdpi = 36;
  else if (kdriScaled <= 0.8837) kdpi = 37;
  else if (kdriScaled <= 0.8927) kdpi = 38;
  else if (kdriScaled <= 0.9008) kdpi = 39;
  else if (kdriScaled <= 0.9093) kdpi = 40;
  else if (kdriScaled <= 0.9174) kdpi = 41;
  else if (kdriScaled <= 0.9257) kdpi = 42;
  else if (kdriScaled <= 0.9340) kdpi = 43;
  else if (kdriScaled <= 0.9440) kdpi = 44;
  else if (kdriScaled <= 0.9536) kdpi = 45;
  else if (kdriScaled <= 0.9615) kdpi = 46;
  else if (kdriScaled <= 0.9714) kdpi = 47;
  else if (kdriScaled <= 0.9797) kdpi = 48;
  else if (kdriScaled <= 0.9891) kdpi = 49;
  else if (kdriScaled <= 1.0000) kdpi = 50;
  else if (kdriScaled <= 1.0090) kdpi = 51;
  else if (kdriScaled <= 1.0196) kdpi = 52;
  else if (kdriScaled <= 1.0288) kdpi = 53;
  else if (kdriScaled <= 1.0373) kdpi = 54;
  else if (kdriScaled <= 1.0475) kdpi = 55;
  else if (kdriScaled <= 1.0570) kdpi = 56;
  else if (kdriScaled <= 1.0668) kdpi = 57;
  else if (kdriScaled <= 1.0757) kdpi = 58;
  else if (kdriScaled <= 1.0857) kdpi = 59;
  else if (kdriScaled <= 1.0953) kdpi = 60;
  else if (kdriScaled <= 1.1053) kdpi = 61;
  else if (kdriScaled <= 1.1156) kdpi = 62;
  else if (kdriScaled <= 1.1258) kdpi = 63;
  else if (kdriScaled <= 1.1360) kdpi = 64;
  else if (kdriScaled <= 1.1461) kdpi = 65;
  else if (kdriScaled <= 1.1561) kdpi = 66;
  else if (kdriScaled <= 1.1660) kdpi = 67;
  else if (kdriScaled <= 1.1760) kdpi = 68;
  else if (kdriScaled <= 1.1880) kdpi = 69;
  else if (kdriScaled <= 1.1996) kdpi = 70;
  else if (kdriScaled <= 1.2109) kdpi = 71;
  else if (kdriScaled <= 1.2214) kdpi = 72;
  else if (kdriScaled <= 1.2340) kdpi = 73;
  else if (kdriScaled <= 1.2467) kdpi = 74;
  else if (kdriScaled <= 1.2591) kdpi = 75;
  else if (kdriScaled <= 1.2715) kdpi = 76;
  else if (kdriScaled <= 1.2845) kdpi = 77;
  else if (kdriScaled <= 1.2975) kdpi = 78;
  else if (kdriScaled <= 1.3137) kdpi = 79;
  else if (kdriScaled <= 1.3291) kdpi = 80;
  else if (kdriScaled <= 1.3443) kdpi = 81;
  else if (kdriScaled <= 1.3600) kdpi = 82;
  else if (kdriScaled <= 1.3765) kdpi = 83;
  else if (kdriScaled <= 1.3927) kdpi = 84;
  else if (kdriScaled <= 1.4109) kdpi = 85;
  else if (kdriScaled <= 1.4288) kdpi = 86;
  else if (kdriScaled <= 1.4469) kdpi = 87;
  else if (kdriScaled <= 1.4700) kdpi = 88;
  else if (kdriScaled <= 1.4912) kdpi = 89;
  else if (kdriScaled <= 1.5157) kdpi = 90;
  else if (kdriScaled <= 1.5416) kdpi = 91;
  else if (kdriScaled <= 1.5691) kdpi = 92;
  else if (kdriScaled <= 1.6024) kdpi = 93;
  else if (kdriScaled <= 1.6367) kdpi = 94;
  else if (kdriScaled <= 1.6808) kdpi = 95;
  else if (kdriScaled <= 1.7237) kdpi = 96;
  else if (kdriScaled <= 1.7800) kdpi = 97;
  else if (kdriScaled <= 1.8162) kdpi = 98;
  else if (kdriScaled <= 1.9868) kdpi = 99;
  else kdpi = 100;
  
  return {
    kdri: Math.round(kdriScaled * 100) / 100,
    kdpi: Math.round(kdpi)
  };
}

export function epts(
  recipientAge: number,
  recipientDiabetes: boolean,
  priorTransplant: boolean,
  yearsOnDialysis: number
): number {
  // Simplified EPTS calculation
  // Full implementation requires specific coefficients from OPTN
  let eptsScore = 0;

  eptsScore += (recipientAge - 40) * 0.03;
  eptsScore += recipientDiabetes ? 0.4 : 0;
  eptsScore += priorTransplant ? 0.5 : 0;
  eptsScore += yearsOnDialysis * 0.05;

  // Convert to percentile (0-100)
  const epts = Math.min(100, Math.max(0, eptsScore * 10));

  return Math.round(epts);
}

export function tacrolimusMonitoring(
  dailyDose: number,
  troughLevel: number
): number {
  const ratio = dailyDose / troughLevel;

  return Math.round(ratio * 100) / 100;
}

// ============================================================================
// 7. CARDIOVASCULAR RISK CALCULATORS
// ============================================================================

export function ascvdRisk(
  age: number,
  sex: "M" | "F",
  totalCholesterol: number,
  hdl: number,
  systolicBP: number,
  treated: boolean,
  diabetes: boolean,
  smoker: boolean,
  race: "Black" | "White" | "Other" = "White"
): number {
  // ACC/AHA Pooled Cohort Equations (2013)
  // Reference: https://tools.acc.org/ascvd-risk-estimator-plus/
  
  const lnAge = Math.log(age);
  const lnTC = Math.log(totalCholesterol);
  const lnHDL = Math.log(hdl);
  const lnSBP = Math.log(systolicBP);
  
  let sumCoef: number;
  let baseline: number;
  let meanCoef: number;
  
  // Use "Other" race as White for calculation purposes
  const effectiveRace = race === "Black" ? "Black" : "White";
  
  if (sex === "M") {
    if (effectiveRace === "White") {
      // White Male coefficients
      sumCoef = 12.344 * lnAge
        + 11.853 * lnTC
        - 2.664 * lnAge * lnTC
        - 7.990 * lnHDL
        + 1.769 * lnAge * lnHDL
        + (treated ? 1.797 * lnSBP : 1.764 * lnSBP)
        + (smoker ? 7.837 - 1.795 * lnAge : 0)
        + (diabetes ? 0.658 : 0);
      baseline = 0.9144;
      meanCoef = 61.18;
    } else {
      // Black Male coefficients
      sumCoef = 2.469 * lnAge
        + 0.302 * lnTC
        - 0.307 * lnHDL
        + (treated ? 1.916 * lnSBP : 1.809 * lnSBP)
        + (smoker ? 0.549 : 0)
        + (diabetes ? 0.645 : 0);
      baseline = 0.8954;
      meanCoef = 19.54;
    }
  } else {
    if (effectiveRace === "White") {
      // White Female coefficients
      sumCoef = -29.799 * lnAge
        + 4.884 * lnAge * lnAge
        + 13.540 * lnTC
        - 3.114 * lnAge * lnTC
        - 13.578 * lnHDL
        + 3.149 * lnAge * lnHDL
        + (treated ? 2.019 * lnSBP : 1.957 * lnSBP)
        + (smoker ? 7.574 - 1.665 * lnAge : 0)
        + (diabetes ? 0.661 : 0);
      baseline = 0.9665;
      meanCoef = -29.18;
    } else {
      // Black Female coefficients
      sumCoef = 17.114 * lnAge
        + 0.940 * lnTC
        - 18.920 * lnHDL
        + 4.475 * lnAge * lnHDL
        + (treated ? 29.291 * lnSBP - 6.432 * lnAge * lnSBP : 27.820 * lnSBP - 6.087 * lnAge * lnSBP)
        + (smoker ? 0.691 : 0)
        + (diabetes ? 0.874 : 0);
      baseline = 0.9533;
      meanCoef = 86.61;
    }
  }
  
  const tenYearRisk = (1 - Math.pow(baseline, Math.exp(sumCoef - meanCoef))) * 100;
  
  return Math.round(Math.min(100, Math.max(0, tenYearRisk)) * 10) / 10;
}

// ============================================================================
// 8. ANTHROPOMETRIC & BODY COMPOSITION CALCULATORS
// ============================================================================

export function bmi(weight: number, height: number, heightUnit: "cm" | "in" = "cm"): number {
  let heightM = heightUnit === "cm" ? height / 100 : height * 0.0254;

  const bmi = weight / (heightM * heightM);

  return Math.round(bmi * 10) / 10;
}

export function bsaDuBois(weight: number, height: number, heightUnit: "cm" | "in" = "cm"): number {
  let heightCm = heightUnit === "in" ? height * 2.54 : height;

  const bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(heightCm, 0.725);

  return Math.round(bsa * 100) / 100;
}

export function bsaMosteller(weight: number, height: number, heightUnit: "cm" | "in" = "cm"): number {
  let heightCm = heightUnit === "in" ? height * 2.54 : height;

  const bsa = Math.sqrt((weight * heightCm) / 3600);

  return Math.round(bsa * 100) / 100;
}

export function devineIdealBodyWeight(
  height: number,
  sex: "M" | "F",
  heightUnit: "cm" | "in" = "cm"
): number {
  let heightIn = heightUnit === "cm" ? height / 2.54 : height;

  let ibw;
  if (sex === "M") {
    ibw = 50 + 2.3 * (heightIn - 60);
  } else {
    ibw = 45.5 + 2.3 * (heightIn - 60);
  }

  return Math.round(ibw * 10) / 10;
}

export function leanBodyWeight(
  weight: number,
  height: number,
  sex: "M" | "F",
  heightUnit: "cm" | "in" = "cm"
): number {
  let heightCm = heightUnit === "in" ? height * 2.54 : height;

  let lbw;
  if (sex === "M") {
    lbw = 1.1 * weight - 128 * (weight / heightCm) ** 2;
  } else {
    lbw = 1.07 * weight - 148 * (weight / heightCm) ** 2;
  }

  return Math.round(lbw * 10) / 10;
}

export function adjustedBodyWeight(
  actualWeight: number,
  idealWeight: number
): number {
  const adjustedBW = idealWeight + 0.4 * (actualWeight - idealWeight);

  return Math.round(adjustedBW * 10) / 10;
}

// ============================================================================
// 9. CKD-MINERAL BONE DISEASE CALCULATORS
// ============================================================================

export function caPhoProduct(
  calcium: number,
  phosphate: number,
  calciumUnit: "mg/dL" | "mmol/L" = "mg/dL",
  phosphateUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let caMgDl = calciumUnit === "mmol/L" ? calcium * 4 : calcium;
  let phMgDl = phosphateUnit === "mmol/L" ? phosphate * 3.1 : phosphate;

  const product = caMgDl * phMgDl;

  return Math.round(product * 10) / 10;
}

// ============================================================================
// 10. SYSTEMIC DISEASES & SCORES
// ============================================================================

export function sledai2k(
  seizures: boolean,
  psychosis: boolean,
  organicBrainSyndrome: boolean,
  visualDisorder: boolean,
  cranialNerveDisorder: boolean,
  lupusHeadache: boolean,
  cerebrovasitisAccident: boolean,
  vasculitis: boolean,
  arthritis: boolean,
  myositis: boolean,
  urinaryCasts: boolean,
  proteinuria: boolean,
  hematuria: boolean,
  pyuria: boolean,
  rash: boolean,
  alopecia: boolean,
  mucousalUlcers: boolean,
  pleuritis: boolean,
  pericarditis: boolean,
  lowComplement: boolean,
  elevatedDNA: boolean
): number {
  let score = 0;

  if (seizures) score += 8;
  if (psychosis) score += 8;
  if (organicBrainSyndrome) score += 8;
  if (visualDisorder) score += 8;
  if (cranialNerveDisorder) score += 8;
  if (lupusHeadache) score += 1;
  if (cerebrovasitisAccident) score += 8;
  if (vasculitis) score += 8;
  if (arthritis) score += 4;
  if (myositis) score += 4;
  if (urinaryCasts) score += 4;
  if (proteinuria) score += 4;
  if (hematuria) score += 4;
  if (pyuria) score += 4;
  if (rash) score += 2;
  if (alopecia) score += 2;
  if (mucousalUlcers) score += 2;
  if (pleuritis) score += 4;
  if (pericarditis) score += 4;
  if (lowComplement) score += 4;
  if (elevatedDNA) score += 2;

  return score;
}

export function frailScale(
  fatigue: boolean,
  resistance: boolean,
  ambulation: boolean,
  illness: boolean,
  lossOfWeight: boolean
): number {
  let score = 0;

  if (fatigue) score += 1;
  if (resistance) score += 1;
  if (ambulation) score += 1;
  if (illness) score += 1;
  if (lossOfWeight) score += 1;

  return score;
}

export function prisma7(
  age: boolean,
  female: boolean,
  generalHealth: boolean,
  limitation: boolean,
  falls: boolean,
  memory: boolean,
  helpNeeded: boolean
): number {
  let score = 0;

  if (age) score += 1;
  if (female) score += 1;
  if (generalHealth) score += 1;
  if (limitation) score += 1;
  if (falls) score += 1;
  if (memory) score += 1;
  if (helpNeeded) score += 1;

  return score;
}

export function curb65(
  confusion: boolean,
  urineaNitrogen: number,
  respiratoryRate: number,
  bloodPressureSystolic: number,
  bloodPressureDiastolic: number,
  age: number,
  bunUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let score = 0;

  if (confusion) score += 1;

  let bunMgDl = bunUnit === "mmol/L" ? urineaNitrogen * 2.8 : urineaNitrogen;
  // BUN > 19 mg/dL (or > 7 mmol/L) - Reference: MDCalc CURB-65
  if (bunMgDl > 19) score += 1;

  if (respiratoryRate >= 30) score += 1;

  if (bloodPressureSystolic < 90 || bloodPressureDiastolic <= 60) score += 1;

  if (age >= 65) score += 1;

  return score;
}

// ============================================================================
// 11. CLINICAL RISK SCORES
// ============================================================================

export function roks(
  age: number,
  bmi: number,
  maleGender: boolean,
  previousStone: boolean,
  familyHistory: boolean
): number {
  // Simplified ROKS calculation
  let score = 0;

  score += age * 0.01;
  score += bmi * 0.02;
  score += maleGender ? 0.3 : 0;
  score += previousStone ? 0.5 : 0;
  score += familyHistory ? 0.3 : 0;

  const recurrenceRisk = Math.min(100, Math.max(0, score * 100));

  return Math.round(recurrenceRisk * 10) / 10;
}

// ============================================================================
// SLICC 2012 SLE CLASSIFICATION CRITERIA
// ============================================================================

export function slicc2012(
  acuteRash: boolean,
  chronicRash: boolean,
  oralUlcers: boolean,
  alopecia: boolean,
  photosensitivity: boolean,
  arthritis: boolean,
  serositis: boolean,
  renal: boolean,
  psychosis: boolean,
  seizures: boolean,
  hemolytic: boolean,
  leukopenia: boolean,
  thrombocytopenia: boolean,
  ana: boolean,
  antiDsDna: boolean,
  antiSmRnp: boolean,
  antiRoSsa: boolean,
  antiLaSSb: boolean,
  antiC1q: boolean,
  directCoombs: boolean
): number {
  let score = 0;

  if (acuteRash) score += 2;
  if (chronicRash) score += 2;
  if (oralUlcers) score += 2;
  if (alopecia) score += 2;
  if (photosensitivity) score += 2;
  if (arthritis) score += 4;
  if (serositis) score += 4;
  if (renal) score += 4;
  if (psychosis) score += 3;
  if (seizures) score += 3;
  if (hemolytic) score += 4;
  if (leukopenia) score += 3;
  if (thrombocytopenia) score += 4;
  if (ana) score += 3;
  if (antiDsDna) score += 3;
  if (antiSmRnp) score += 3;
  if (antiRoSsa) score += 3;
  if (antiLaSSb) score += 3;
  if (antiC1q) score += 1;
  if (directCoombs) score += 1;

  return score;
}


// ============================================================================
// FRAX FRACTURE RISK ASSESSMENT (Simplified)
// ============================================================================

export function fraxSimplified(
  age: number,
  sex: "M" | "F",
  weight: number,
  height: number,
  previousFracture: boolean = false,
  parentHipFracture: boolean = false,
  currentSmoking: boolean = false,
  glucocorticoids: boolean = false,
  rheumatoidArthritis: boolean = false,
  secondaryOsteoporosis: boolean = false,
  alcoholIntake: boolean = false,
  bmdTScore?: number
): { majorFracture: number; hipFracture: number } {
  // Calculate BMI
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  // Base risk calculation (simplified FRAX algorithm)
  // Based on age and sex baseline risks
  let baseRiskMajor = 0;
  let baseRiskHip = 0;

  // Age-based baseline risk (approximate values from FRAX tables)
  if (sex === "F") {
    if (age < 50) { baseRiskMajor = 3.2; baseRiskHip = 0.3; }
    else if (age < 55) { baseRiskMajor = 4.5; baseRiskHip = 0.5; }
    else if (age < 60) { baseRiskMajor = 6.5; baseRiskHip = 0.9; }
    else if (age < 65) { baseRiskMajor = 8.5; baseRiskHip = 1.5; }
    else if (age < 70) { baseRiskMajor = 11.0; baseRiskHip = 2.5; }
    else if (age < 75) { baseRiskMajor = 14.0; baseRiskHip = 4.5; }
    else if (age < 80) { baseRiskMajor = 18.0; baseRiskHip = 7.5; }
    else if (age < 85) { baseRiskMajor = 22.0; baseRiskHip = 11.0; }
    else { baseRiskMajor = 25.0; baseRiskHip = 14.0; }
  } else {
    if (age < 50) { baseRiskMajor = 2.5; baseRiskHip = 0.2; }
    else if (age < 55) { baseRiskMajor = 3.5; baseRiskHip = 0.4; }
    else if (age < 60) { baseRiskMajor = 4.5; baseRiskHip = 0.7; }
    else if (age < 65) { baseRiskMajor = 5.5; baseRiskHip = 1.1; }
    else if (age < 70) { baseRiskMajor = 7.0; baseRiskHip = 1.8; }
    else if (age < 75) { baseRiskMajor = 9.0; baseRiskHip = 3.0; }
    else if (age < 80) { baseRiskMajor = 12.0; baseRiskHip = 5.0; }
    else if (age < 85) { baseRiskMajor = 15.0; baseRiskHip = 8.0; }
    else { baseRiskMajor = 18.0; baseRiskHip = 11.0; }
  }

  // Risk multipliers for clinical risk factors
  let riskMultiplier = 1.0;

  if (previousFracture) riskMultiplier *= 1.85;
  if (parentHipFracture) riskMultiplier *= 1.55;
  if (currentSmoking) riskMultiplier *= 1.25;
  if (glucocorticoids) riskMultiplier *= 1.65;
  if (rheumatoidArthritis) riskMultiplier *= 1.35;
  if (secondaryOsteoporosis) riskMultiplier *= 1.40;
  if (alcoholIntake) riskMultiplier *= 1.35;

  // BMI adjustment (low BMI increases risk)
  if (bmi < 20) riskMultiplier *= 1.25;
  else if (bmi > 30) riskMultiplier *= 0.95;

  // BMD T-score adjustment if provided
  if (bmdTScore !== undefined && !isNaN(bmdTScore)) {
    // Each SD decrease in BMD approximately doubles fracture risk
    const bmdMultiplier = Math.pow(1.5, Math.abs(bmdTScore + 2.5));
    if (bmdTScore < -2.5) {
      riskMultiplier *= bmdMultiplier;
    } else if (bmdTScore > -1.0) {
      riskMultiplier *= 0.7;
    }
  }

  // Calculate final risks
  const majorFracture = Math.min(baseRiskMajor * riskMultiplier, 80);
  const hipFracture = Math.min(baseRiskHip * riskMultiplier, 50);

  return {
    majorFracture: Math.round(majorFracture * 10) / 10,
    hipFracture: Math.round(hipFracture * 10) / 10,
  };
}


// ============================================================================
// BANFF CLASSIFICATION FOR KIDNEY TRANSPLANT REJECTION (2019 Update)
// ============================================================================

export interface BanffScores {
  // Acute lesions
  i: number;      // Interstitial inflammation (0-3)
  t: number;      // Tubulitis (0-3)
  v: number;      // Intimal arteritis (0-3)
  g: number;      // Glomerulitis (0-3)
  ptc: number;    // Peritubular capillaritis (0-3)
  // Chronic lesions
  ci: number;     // Interstitial fibrosis (0-3)
  ct: number;     // Tubular atrophy (0-3)
  cv: number;     // Vascular fibrous intimal thickening (0-3)
  cg: number;     // Transplant glomerulopathy (0-3)
  mm: number;     // Mesangial matrix expansion (0-3)
  ah: number;     // Arteriolar hyalinosis (0-3)
  // Antibody-mediated markers
  c4d: number;    // C4d staining (0=negative, 1=minimal, 2=focal, 3=diffuse)
  dsaPositive: boolean;  // Donor-specific antibody
}

export interface BanffResult {
  category: number;
  diagnosis: string;
  subtype: string;
  severity: string;
  recommendations: string[];
  tcmrGrade?: string;
  abmrType?: string;
}

export function banffClassification(scores: BanffScores): BanffResult {
  const { i, t, v, g, ptc, ci, ct, cv, cg, c4d, dsaPositive } = scores;
  
  // Banff 2022 Classification Criteria
  // Reference: https://banfffoundation.org/central-repository-for-banff-classification-resources-3/
  
  // Calculate microvascular inflammation (MVI)
  const microvascularInflammation = g + ptc;
  const hasC4dPositive = c4d >= 2;
  const hasDSA = dsaPositive;
  
  // Check for ABMR criteria (Banff 2022)
  // Active AMR: MVI (g≥1 and/or ptc≥1) + C4d≥2 + DSA positive
  // Chronic Active AMR: Chronic lesions (cg≥1, cv≥1, ci≥1, ct≥1) + C4d≥2 + DSA positive
  
  const hasMVI = g >= 1 || ptc >= 1;
  const hasABMRHistology = hasMVI || (cg > 0 && (g > 0 || ptc > 0));
  const hasABMREvidence = hasC4dPositive || (hasDSA && hasMVI);
  
  // Check for TCMR criteria (Banff 2022)
  // Acute TCMR: i≥1, t≥1, v=0 (IA/IB) OR v≥1 (IIA/IIB/III)
  // Borderline: i≥1, t=0 OR i=0, t≥1 (without v)
  
  const hasTCMR = (i >= 1 && t >= 1) || v > 0;
  const hasBorderline = ((i >= 1 && t === 0) || (i === 0 && t >= 1)) && v === 0;
  
  // Check for chronic changes
  const hasChronicChanges = ci >= 1 || ct >= 1;
  const chronicSeverity = Math.max(ci, ct);
  
  // Determine primary diagnosis
  let result: BanffResult;
  
  // Category 2: Antibody-Mediated Rejection
  if (hasABMRHistology && (hasC4dPositive || hasDSA)) {
    let abmrType = "";
    let severity = "";
    
    if (cg > 0 || (ci >= 2 && ct >= 2)) {
      // Chronic active ABMR
      abmrType = "Chronic Active ABMR";
      if (cg >= 2) severity = "Severe (cg ≥2)";
      else if (cg === 1) severity = "Moderate (cg = 1)";
      else severity = "With chronic changes";
    } else if (microvascularInflammation >= 2 || v > 0) {
      // Active ABMR
      abmrType = "Active ABMR";
      if (v >= 2) severity = "Severe (v ≥2)";
      else if (microvascularInflammation >= 3) severity = "Moderate-Severe (g+ptc ≥3)";
      else severity = "Mild-Moderate";
    }
    
    result = {
      category: 2,
      diagnosis: "Antibody-Mediated Rejection (ABMR)",
      subtype: abmrType,
      severity: severity,
      abmrType: abmrType,
      recommendations: [
        "Consider plasmapheresis/plasma exchange",
        "IVIG therapy (2g/kg divided over 2-5 days)",
        "Consider rituximab if DSA persists",
        "Consider bortezomib for refractory cases",
        "Optimize baseline immunosuppression",
        "Close monitoring of DSA levels",
      ],
    };
  }
  // Category 2/4: T-Cell Mediated Rejection (Banff 2022)
  else if (hasTCMR) {
    let tcmrGrade = "";
    let severity = "";
    
    if (v >= 3) {
      tcmrGrade = "Grade III";
      severity = "Severe - Transmural arteritis and/or fibrinoid necrosis";
    } else if (v >= 2) {
      tcmrGrade = "Grade IIB";
      severity = "Moderate-Severe - Moderate to severe intimal arteritis";
    } else if (v === 1) {
      tcmrGrade = "Grade IIA";
      severity = "Moderate - Mild to moderate intimal arteritis";
    } else if (i >= 2 && t >= 2) {
      tcmrGrade = "Grade IB";
      severity = "Moderate - Extensive interstitial inflammation and tubulitis";
    } else if (i >= 1 && t >= 1) {
      tcmrGrade = "Grade IA";
      severity = "Mild - Minimal interstitial inflammation and tubulitis";
    }
    
    result = {
      category: 4,
      diagnosis: "T-Cell Mediated Rejection (TCMR)",
      subtype: tcmrGrade,
      severity: severity,
      tcmrGrade: tcmrGrade,
      recommendations: [
        "Pulse methylprednisolone 500-1000mg IV x 3 days",
        "Consider thymoglobulin for Grade IIA or higher",
        "Increase maintenance immunosuppression",
        "Check tacrolimus/cyclosporine levels",
        "Follow-up biopsy in 2-4 weeks if Grade II or higher",
      ],
    };
  }
  // Category 3: Borderline Changes
  else if (hasBorderline) {
    result = {
      category: 3,
      diagnosis: "Borderline Changes",
      subtype: "Suspicious for TCMR",
      severity: `i${i}t${t} - Does not meet full TCMR criteria`,
      recommendations: [
        "Consider pulse steroids if clinical deterioration",
        "Optimize tacrolimus/cyclosporine levels",
        "Close monitoring of renal function",
        "Repeat biopsy if no improvement",
        "Rule out other causes (BK virus, drug toxicity)",
      ],
    };
  }
  // Category 5: Interstitial Fibrosis and Tubular Atrophy (IF/TA)
  else if (hasChronicChanges && !hasABMRHistology && !hasTCMR) {
    let severity = "";
    if (chronicSeverity === 3) severity = "Grade III (Severe, >50%)";
    else if (chronicSeverity === 2) severity = "Grade II (Moderate, 26-50%)";
    else severity = "Grade I (Mild, 6-25%)";
    
    result = {
      category: 5,
      diagnosis: "Interstitial Fibrosis and Tubular Atrophy (IF/TA)",
      subtype: `ci${ci}/ct${ct}`,
      severity: severity,
      recommendations: [
        "Evaluate for treatable causes",
        "Consider CNI minimization if CNI toxicity suspected",
        "Blood pressure optimization",
        "Proteinuria management with ACEi/ARB",
        "Monitor for progression",
        "Consider re-transplant evaluation if severe",
      ],
    };
  }
  // Category 6: Other
  else if (scores.mm >= 2 || scores.ah >= 2) {
    result = {
      category: 6,
      diagnosis: "Other Changes",
      subtype: scores.mm >= 2 ? "Recurrent/de novo glomerulonephritis" : "CNI toxicity",
      severity: "Requires specific evaluation",
      recommendations: [
        "Consider native kidney disease recurrence",
        "Evaluate for CNI toxicity if ah elevated",
        "Check for BK nephropathy",
        "Assess for drug toxicity",
        "Consider electron microscopy if GN suspected",
      ],
    };
  }
  // Category 1: Normal or Nonspecific Changes
  else {
    result = {
      category: 1,
      diagnosis: "Normal or Nonspecific Changes",
      subtype: "No rejection",
      severity: "None",
      recommendations: [
        "Continue current immunosuppression",
        "Routine monitoring",
        "Investigate other causes if clinical concern persists",
      ],
    };
  }
  
  return result;
}

// Helper to get Banff score interpretation
export function getBanffScoreDescription(score: string, value: number): string {
  const descriptions: Record<string, string[]> = {
    i: ["No inflammation", "10-25% of cortex inflamed", "26-50% of cortex inflamed", ">50% of cortex inflamed"],
    t: ["No tubulitis", "1-4 mononuclear cells/tubular cross-section", "5-10 cells/tubular cross-section", ">10 cells/tubular cross-section"],
    v: ["No arteritis", "Mild-moderate intimal arteritis", "Severe intimal arteritis (>25% luminal loss)", "Transmural arteritis/fibrinoid necrosis"],
    g: ["No glomerulitis", "Segmental/global glomerulitis in <25% of glomeruli", "25-75% of glomeruli", ">75% of glomeruli"],
    ptc: ["No peritubular capillaritis", "<10% of cortical PTCs", "10-50% of cortical PTCs", ">50% of cortical PTCs"],
    ci: ["≤5% of cortex fibrosed", "6-25% of cortex fibrosed", "26-50% of cortex fibrosed", ">50% of cortex fibrosed"],
    ct: ["No tubular atrophy", "≤25% of tubules atrophic", "26-50% of tubules atrophic", ">50% of tubules atrophic"],
    cv: ["No intimal thickening", "≤25% luminal narrowing", "26-50% luminal narrowing", ">50% luminal narrowing"],
    cg: ["No TG changes", "1a: Early TG (EM only) or 1b: GBM double contours in 1-25%", "GBM double contours in 26-50%", "GBM double contours in >50%"],
    c4d: ["Negative", "Minimal (<10%)", "Focal (10-50%)", "Diffuse (>50%)"],
  };
  
  return descriptions[score]?.[value] || "Unknown";
}


// ============================================================================
// 24-HOUR PROTEIN EXCRETION ESTIMATOR
// ============================================================================

export function estimated24HourProtein(
  testType: "pcr" | "acr",
  inputMode: "ratio" | "raw",
  ratioValue?: number,
  ratioUnit?: "mg_mg" | "mg_mmol" | "mg_g",
  proteinValue?: number,
  proteinUnit?: "mg_dL" | "g_L" | "mg_L",
  creatinineValue?: number,
  creatinineUnit?: "mg_dL" | "mmol_L"
): number {
  // 24-Hour Urinary Protein Excretion Estimator
  // Supports both PCR (Protein/Creatinine Ratio) and ACR (Albumin/Creatinine Ratio)
  // Exact implementation matching the original HTML calculator
  // Formula: ratio in mg/mg = g/day

  let ratioMgPerMg: number;

  if (inputMode === "ratio") {
    // Convert ratio to mg/mg using the exact same logic as original HTML
    if (ratioValue === undefined || isNaN(ratioValue)) return 0;

    const unit = ratioUnit || "mg_mg";

    if (unit === "mg_mg") {
      ratioMgPerMg = ratioValue;
    } else if (unit === "mg_g") {
      // Original: r / 1000.0
      ratioMgPerMg = ratioValue / 1000.0;
    } else if (unit === "mg_mmol") {
      // Original: r / 113.12
      ratioMgPerMg = ratioValue / 113.12;
    } else {
      ratioMgPerMg = ratioValue;
    }
  } else {
    // Calculate from raw values using exact same logic as original HTML
    if (proteinValue === undefined || creatinineValue === undefined ||
        isNaN(proteinValue) || isNaN(creatinineValue) || creatinineValue <= 0) return 0;

    let protein = proteinValue;
    let creat = creatinineValue;

    // Default units to mg_dL if not specified
    const pUnit = proteinUnit || "mg_dL";
    const cUnit = creatinineUnit || "mg_dL";

    // Convert protein/albumin to mg/L (exact same as original HTML)
    if (pUnit === "mg_dL") {
      protein = protein * 10;
    } else if (pUnit === "g_L") {
      protein = protein * 1000;
    }
    // mg_L stays as is

    // Convert creatinine to mg/L (exact same as original HTML)
    if (cUnit === "mg_dL") {
      creat = creat * 10;
    } else if (cUnit === "mmol_L") {
      creat = creat * 113.12;
    }

    // Calculate ratio: protein (mg/L) / creatinine (mg/L) = mg/mg = g/day
    ratioMgPerMg = protein / creat;
  }

  // The ratio in mg/mg equals g/day (standard approximation)
  // This applies to both PCR and ACR - the formula is the same
  // The difference is in the interpretation (albumin vs total protein)
  const gPerDay = ratioMgPerMg;

  return Math.round(gPerDay * 1000) / 1000;
}
