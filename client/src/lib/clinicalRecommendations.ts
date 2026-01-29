/**
 * Clinical Decision Support Recommendations
 * Evidence-based recommendations for calculator results
 */

export interface ClinicalRecommendation {
  condition: string;
  recommendation: string;
  actionItems: string[];
  references?: string[];
  urgency?: "routine" | "urgent" | "emergent";
}

export interface RecommendationSet {
  calculatorId: string;
  recommendations: {
    [key: string]: ClinicalRecommendation;
  };
}

// Clinical recommendations by calculator result ranges
export const clinicalRecommendations: RecommendationSet[] = [
  {
    calculatorId: "ckd-epi-creatinine",
    recommendations: {
      "stage1": {
        condition: "CKD Stage 1 (eGFR ≥90)",
        recommendation: "Normal kidney function with possible kidney disease (albuminuria/imaging abnormality)",
        actionItems: [
          "Assess for albuminuria or imaging abnormalities",
          "Screen for CKD risk factors (diabetes, hypertension)",
          "Repeat eGFR annually if risk factors present",
          "Provide cardiovascular risk reduction counseling"
        ],
        urgency: "routine"
      },
      "stage2": {
        condition: "CKD Stage 2 (eGFR 60-89)",
        recommendation: "Mildly decreased kidney function",
        actionItems: [
          "Confirm CKD with repeat eGFR in 2-4 weeks",
          "Assess albuminuria status",
          "Screen and manage CKD risk factors",
          "Refer to nephrology if rapid decline or albuminuria",
          "Annual eGFR monitoring"
        ],
        urgency: "routine"
      },
      "stage3a": {
        condition: "CKD Stage 3a (eGFR 45-59)",
        recommendation: "Mild to moderate decrease in kidney function",
        actionItems: [
          "Confirm CKD diagnosis with repeat eGFR",
          "Assess albuminuria and proteinuria",
          "Optimize blood pressure control (target <120 mmHg)",
          "Screen for complications (anemia, bone disease)",
          "Consider nephrology referral",
          "Monitor eGFR every 6-12 months"
        ],
        urgency: "routine"
      },
      "stage3b": {
        condition: "CKD Stage 3b (eGFR 30-44)",
        recommendation: "Moderate decrease in kidney function",
        actionItems: [
          "Refer to nephrology for management",
          "Assess for CKD complications (anemia, mineral-bone disease)",
          "Optimize blood pressure and glycemic control",
          "Screen for cardiovascular disease",
          "Educate on CKD progression and lifestyle",
          "Monitor eGFR every 3-6 months",
          "Adjust medication dosing for renal function"
        ],
        urgency: "routine"
      },
      "stage4": {
        condition: "CKD Stage 4 (eGFR 15-29)",
        recommendation: "Severe decrease in kidney function - prepare for renal replacement therapy",
        actionItems: [
          "Refer to nephrology urgently",
          "Assess for dialysis/transplant candidacy",
          "Screen and treat CKD-mineral bone disease",
          "Manage anemia with ESA/iron",
          "Strict blood pressure control",
          "Avoid nephrotoxic agents",
          "Plan vascular access for dialysis",
          "Monitor eGFR monthly"
        ],
        urgency: "urgent"
      },
      "stage5": {
        condition: "CKD Stage 5 (eGFR <15)",
        recommendation: "Kidney failure - initiate renal replacement therapy",
        actionItems: [
          "Urgent nephrology referral if not already involved",
          "Initiate dialysis or prepare for transplantation",
          "Manage fluid and electrolyte balance",
          "Treat complications (anemia, bone disease, hypertension)",
          "Nutritional counseling",
          "Psychosocial support",
          "Discuss treatment modalities and prognosis"
        ],
        urgency: "emergent"
      }
    }
  },
  {
    calculatorId: "kfre",
    recommendations: {
      "low": {
        condition: "Low Risk (<10%)",
        recommendation: "Low risk of kidney failure progression",
        actionItems: [
          "Continue current management",
          "Optimize blood pressure and glycemic control",
          "Repeat KFRE annually",
          "Monitor for albuminuria changes"
        ],
        urgency: "routine"
      },
      "moderate": {
        condition: "Moderate Risk (10-40%)",
        recommendation: "Moderate risk - consider intensified management",
        actionItems: [
          "Intensify blood pressure control (target <120 mmHg)",
          "Optimize glycemic control (if diabetic)",
          "Consider SGLT2 inhibitor or GLP-1 agonist",
          "Screen for and treat complications",
          "Repeat KFRE every 6-12 months",
          "Nephrology follow-up every 3-6 months"
        ],
        urgency: "routine"
      },
      "high": {
        condition: "High Risk (>40%)",
        recommendation: "High risk of progression - urgent intervention needed",
        actionItems: [
          "Urgent nephrology referral",
          "Aggressive blood pressure control",
          "Maximize ACEi/ARB therapy",
          "Consider SGLT2 inhibitor",
          "Screen for complications",
          "Prepare for renal replacement therapy",
          "Repeat KFRE every 3-6 months"
        ],
        urgency: "urgent"
      }
    }
  },
  {
    calculatorId: "cin-mehran",
    recommendations: {
      "low": {
        condition: "Low Risk (<8%)",
        recommendation: "Low risk of contrast-induced nephropathy",
        actionItems: [
          "Proceed with contrast study",
          "Maintain hydration",
          "Monitor renal function 48-72 hours post-procedure"
        ],
        urgency: "routine"
      },
      "moderate": {
        condition: "Moderate Risk (8-16%)",
        recommendation: "Moderate risk - implement prevention measures",
        actionItems: [
          "IV hydration (0.9% saline 1 mL/kg/hr for 12 hours pre/post)",
          "Hold metformin 48 hours after procedure",
          "Avoid NSAIDs for 48 hours",
          "Use iso-osmolar or low-osmolar contrast",
          "Monitor renal function at 48-72 hours",
          "Consider N-acetylcysteine (controversial)"
        ],
        urgency: "routine"
      },
      "high": {
        condition: "High Risk (16-26%)",
        recommendation: "High risk - aggressive prevention required",
        actionItems: [
          "Consider alternative imaging without contrast",
          "If contrast necessary: aggressive IV hydration",
          "Hold metformin, NSAIDs, ACEi/ARB if possible",
          "Use iso-osmolar contrast",
          "Minimize contrast volume",
          "Monitor renal function closely",
          "Consider N-acetylcysteine"
        ],
        urgency: "urgent"
      },
      "veryhigh": {
        condition: "Very High Risk (>26%)",
        recommendation: "Very high risk - consider non-contrast imaging",
        actionItems: [
          "Strongly consider alternative imaging modality",
          "If contrast essential: consult nephrology",
          "Aggressive IV hydration",
          "Minimize contrast volume",
          "Use iso-osmolar contrast",
          "Hold nephrotoxic medications",
          "Close monitoring post-procedure",
          "Prepare for possible dialysis"
        ],
        urgency: "emergent"
      }
    }
  },
  {
    calculatorId: "ascvd",
    recommendations: {
      "low": {
        condition: "Low Risk (<5%)",
        recommendation: "Low 10-year ASCVD risk",
        actionItems: [
          "Continue healthy lifestyle",
          "Aspirin not routinely recommended",
          "Recheck risk every 4-6 years",
          "Manage modifiable risk factors"
        ],
        urgency: "routine"
      },
      "borderline": {
        condition: "Borderline Risk (5-7.5%)",
        recommendation: "Borderline risk - consider statin therapy",
        actionItems: [
          "Discuss statin therapy with patient",
          "Optimize lifestyle modifications",
          "Consider risk enhancers (family history, LDL-C, CKD)",
          "Target LDL-C <100 mg/dL",
          "Recheck risk annually"
        ],
        urgency: "routine"
      },
      "intermediate": {
        condition: "Intermediate Risk (7.5-20%)",
        recommendation: "Intermediate risk - statin therapy recommended",
        actionItems: [
          "Initiate moderate-intensity statin",
          "Target LDL-C 70-100 mg/dL",
          "Optimize blood pressure control",
          "Manage diabetes if present",
          "Smoking cessation",
          "Regular exercise (150 min/week)",
          "Recheck lipids in 4-12 weeks"
        ],
        urgency: "routine"
      },
      "high": {
        condition: "High Risk (>20%)",
        recommendation: "High 10-year ASCVD risk - aggressive management",
        actionItems: [
          "Initiate high-intensity statin",
          "Target LDL-C <70 mg/dL",
          "Consider ezetimibe or PCSK9 inhibitor if LDL not at goal",
          "Aggressive blood pressure control",
          "Intensive lifestyle modification",
          "Aspirin therapy",
          "Screen for subclinical disease",
          "Cardiology referral if indicated"
        ],
        urgency: "urgent"
      }
    }
  }
];

export function getRecommendations(
  calculatorId: string,
  resultKey: string
): ClinicalRecommendation | null {
  const recommendationSet = clinicalRecommendations.find(
    (rs) => rs.calculatorId === calculatorId
  );
  
  if (!recommendationSet) return null;
  
  return recommendationSet.recommendations[resultKey] || null;
}
