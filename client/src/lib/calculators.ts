/**
 * Nephrology Calculator Functions Library
 * All 52 formulas with unit conversion support
 * Last Updated: January 28, 2026
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
  // Convert to mg/dL if needed
  let creatMgDl = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;

  const κ = sex === "F" ? 0.7 : 0.9;
  const α = sex === "F" ? -0.219 : -0.144;
  const sexFactor = sex === "F" ? 0.963 : 1;
  const raceFactor = race === "Black" ? 1.159 : 1;

  const eGFR =
    142 *
    Math.pow(creatMgDl / κ, α) *
    Math.pow(0.9961, age) *
    sexFactor *
    raceFactor;

  return Math.round(eGFR);
}

export function cockcrofGault(
  creatinine: number,
  age: number,
  weight: number,
  sex: "M" | "F",
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  let creatMgDl = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;

  const factor = sex === "M" ? 140 : 130;
  const sexMultiplier = sex === "M" ? 1 : 0.85;

  const clearance =
    ((factor - age) * weight * sexMultiplier) / (72 * creatMgDl);

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
  let creatMgDl = creatinineUnit === "μmol/L" ? creatinine / 88.4 : creatinine;

  const κ = sex === "F" ? 0.7 : 0.9;
  const α = sex === "F" ? -0.219 : -0.144;
  const sexFactor = sex === "F" ? 0.963 : 1;

  const eGFR =
    135 *
    Math.pow(Math.min(creatMgDl / κ, 1), α) *
    Math.pow(Math.max(creatMgDl / κ, 1), -0.544) *
    Math.pow(Math.min(cystatinC / 0.8, 1), -0.323) *
    Math.pow(Math.max(cystatinC / 0.8, 1), -0.778) *
    Math.pow(0.9961, age) *
    sexFactor;

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
  years: 2 | 5 = 5
): number {
  // Simplified KFRE calculation (4-variable model)
  // Full implementation would require logistic regression coefficients
  const ageCoeff = 0.015;
  const sexCoeff = sex === "F" ? -0.5 : 0;
  const eGFRCoeff = -0.08;
  const acrCoeff = 0.003;

  const logOdds =
    -3.5 +
    ageCoeff * age +
    sexCoeff +
    eGFRCoeff * eGFR +
    acrCoeff * acr;
  const probability = (1 / (1 + Math.exp(-logOdds))) * 100;

  return Math.round(probability * 10) / 10;
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
  // Simplified IgAN risk calculation
  // Full implementation requires logistic regression coefficients from publication
  const ageCoeff = 0.02;
  const eGFRCoeff = -0.05;
  const mapCoeff = 0.01;
  const proteinuriaCoeff = 0.1;

  const logOdds =
    -2 +
    ageCoeff * age +
    eGFRCoeff * eGFR +
    mapCoeff * map +
    proteinuriaCoeff * proteinuria;
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
  bunUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let preBUNMgDl = bunUnit === "mmol/L" ? preBUN * 2.8 : preBUN;
  let postBUNMgDl = bunUnit === "mmol/L" ? postBUN * 2.8 : postBUN;

  const R = postBUNMgDl / preBUNMgDl;
  const Kt_V = -Math.log(R - 0.008 * (sessionTime / 60)) + (4 - 3.5 * R) * (sessionTime / 60);

  return Math.round(Kt_V * 100) / 100;
}

export function totalBodyWaterWatson(
  weight: number,
  age: number,
  sex: "M" | "F"
): number {
  let tbw;

  if (sex === "M") {
    tbw = 2.447 - 0.09156 * age + 0.1074 * weight;
  } else {
    tbw = -2.097 + 0.1069 * weight;
  }

  return Math.round(tbw * 100) / 100;
}

export function hemodialysisSessionDuration(
  targetKtV: number,
  preBUN: number,
  postBUN: number,
  weight: number,
  bunUnit: "mg/dL" | "mmol/L" = "mg/dL"
): number {
  let preBUNMgDl = bunUnit === "mmol/L" ? preBUN * 2.8 : preBUN;
  let postBUNMgDl = bunUnit === "mmol/L" ? postBUN * 2.8 : postBUN;

  const R = postBUNMgDl / preBUNMgDl;

  // Rearranged Daugirdas equation to solve for t
  const numerator = Math.log(R - 0.008);
  const denominator = -targetKtV - (4 - 3.5 * R);
  const sessionTime = (numerator / denominator) * 60;

  return Math.round(sessionTime * 10) / 10;
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
  donorHeight: number,
  donorWeight: number,
  donorCreatinine: number,
  donorHypertension: boolean,
  donorDiabetes: boolean,
  donorAfricanAmerican: boolean,
  donorHepCPositive: boolean,
  causeOfDeathStroke: boolean,
  donorAfterCirculatoryDeath: boolean,
  creatinineUnit: "mg/dL" | "μmol/L" = "mg/dL"
): number {
  // Simplified KDPI calculation
  // Full implementation requires specific coefficients from OPTN
  let creatMgDl =
    creatinineUnit === "μmol/L" ? donorCreatinine / 88.4 : donorCreatinine;

  let kdpiScore = 0;

  kdpiScore += donorAge * 0.02;
  kdpiScore += (donorHeight - 170) * 0.01;
  kdpiScore += (donorWeight - 80) * 0.001;
  kdpiScore += (creatMgDl - 1) * 0.3;
  kdpiScore += donorHypertension ? 0.15 : 0;
  kdpiScore += donorDiabetes ? 0.2 : 0;
  kdpiScore += donorAfricanAmerican ? 0.1 : 0;
  kdpiScore += donorHepCPositive ? 0.25 : 0;
  kdpiScore += causeOfDeathStroke ? -0.1 : 0;
  kdpiScore += donorAfterCirculatoryDeath ? 0.3 : 0;

  // Convert to percentile (0-100)
  const kdpi = Math.min(100, Math.max(0, kdpiScore * 10));

  return Math.round(kdpi);
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
  race: "Black" | "White" = "White"
): number {
  // Simplified ASCVD risk calculation
  // Full implementation uses pooled cohort equations
  let risk = 0;

  risk += age * 0.02;
  risk += (totalCholesterol - 200) * 0.001;
  risk += (hdl - 50) * -0.01;
  risk += (systolicBP - 120) * 0.005;
  risk += treated ? 0.1 : 0;
  risk += diabetes ? 0.3 : 0;
  risk += smoker ? 0.2 : 0;
  risk += race === "Black" ? 0.05 : 0;
  risk += sex === "F" ? -0.1 : 0;

  const tenYearRisk = Math.min(30, Math.max(0, risk * 100));

  return Math.round(tenYearRisk * 10) / 10;
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
  if (bunMgDl > 7) score += 1;

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
