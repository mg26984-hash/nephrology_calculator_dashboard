/**
 * ASNRT Nephrology Calculator Dashboard
 * Professional open-access calculator for nephrologists
 * 53 calculators organized by clinical category
 * Features: Light/Dark theme, inline unit conversion per input, mobile-friendly
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { 
  Calculator, 
  Sun, 
  Moon, 
  Menu, 
  Search, 
  ChevronRight,
  Activity,
  Droplets,
  Heart,
  Scale,
  Pill,
  Stethoscope,
  FlaskConical,
  Bone,
  Brain,
  AlertTriangle,
  Info,
  X,
  Star,
  Clock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculators, getCategories, getCalculatorById, CalculatorInput } from "@/lib/calculatorData";
import * as calc from "@/lib/calculators";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface CalculatorState {
  [key: string]: string | number | boolean;
}

// Unit state for each input field
interface UnitState {
  [inputId: string]: string;
}

// Category icons mapping
const categoryIcons: { [key: string]: React.ReactNode } = {
  "Kidney Function & CKD Risk": <Activity className="w-4 h-4" />,
  "Acute Kidney Injury (AKI) Workup": <AlertTriangle className="w-4 h-4" />,
  "Electrolytes & Acid-Base": <Droplets className="w-4 h-4" />,
  "Proteinuria & Glomerular Disease": <FlaskConical className="w-4 h-4" />,
  "Dialysis Adequacy": <Activity className="w-4 h-4" />,
  "Transplantation": <Heart className="w-4 h-4" />,
  "Cardiovascular Risk": <Heart className="w-4 h-4" />,
  "Anthropometric & Body Composition": <Scale className="w-4 h-4" />,
  "CKD-Mineral Bone Disease": <Bone className="w-4 h-4" />,
  "Systemic Diseases & Scores": <Brain className="w-4 h-4" />,
  "Bone & Fracture Risk": <Bone className="w-4 h-4" />,
};

// Define which inputs support unit conversion and their options
const unitOptions: { [inputId: string]: { conventional: string; si: string; conversionFactor: number } } = {
  creatinine: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  preCreatinine: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  postCreatinine: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  plasmaCr: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  urineCr: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  donorCreatinine: { conventional: "mg/dL", si: "μmol/L", conversionFactor: 88.4 },
  bun: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  preBUN: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  postBUN: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  plasmaUrea: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  urineUrea: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  urineaNitrogen: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.357 },
  glucose: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0555 },
  albumin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
  urineAlbumin: { conventional: "mg", si: "μg", conversionFactor: 1000 },
  calcium: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.25 },
  measuredCa: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.25 },
  phosphate: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.323 },
  totalCholesterol: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0259 },
  hdl: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0259 },
  hemoglobin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
  targetHemoglobin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
  currentHemoglobin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
};

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCalculatorId, setSelectedCalculatorId] = useState<string | null>(null);
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({});
  const [unitState, setUnitState] = useState<UnitState>({});
  const [result, setResult] = useState<number | null>(null);
  const [resultInterpretation, setResultInterpretation] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Favorites state with localStorage persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('nephrology-calculator-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('nephrology-calculator-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite status for a calculator
  const toggleFavorite = useCallback((calcId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent selecting the calculator when clicking the star
    }
    setFavorites(prev => 
      prev.includes(calcId) 
        ? prev.filter(id => id !== calcId)
        : [...prev, calcId]
    );
  }, []);

  // Get favorite calculators
  const favoriteCalculators = useMemo(() => 
    calculators.filter(c => favorites.includes(c.id)),
    [favorites]
  );

  // Recent calculators state with localStorage persistence (max 5)
  const [recentCalculatorIds, setRecentCalculatorIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('nephrology-calculator-recent');
    return saved ? JSON.parse(saved) : [];
  });

  // Save recent calculators to localStorage when they change
  useEffect(() => {
    localStorage.setItem('nephrology-calculator-recent', JSON.stringify(recentCalculatorIds));
  }, [recentCalculatorIds]);

  // Add calculator to recent list (called when selecting a calculator)
  const addToRecent = useCallback((calcId: string) => {
    setRecentCalculatorIds(prev => {
      // Remove if already exists, then add to front
      const filtered = prev.filter(id => id !== calcId);
      // Keep only last 5
      return [calcId, ...filtered].slice(0, 5);
    });
  }, []);

  // Get recent calculators (excluding favorites to avoid duplication)
  const recentCalculators = useMemo(() => 
    calculators.filter(c => recentCalculatorIds.includes(c.id) && !favorites.includes(c.id)),
    [recentCalculatorIds, favorites]
  );

  const categories = useMemo(() => getCategories(), []);
  const selectedCalculator = useMemo(
    () => (selectedCalculatorId ? getCalculatorById(selectedCalculatorId) : null),
    [selectedCalculatorId]
  );

  // Filter calculators based on search and category
  const filteredCalculators = useMemo(() => {
    let filtered = calculators;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  // Group filtered calculators by category
  const groupedCalculators = useMemo(() => {
    const groups: { [key: string]: typeof calculators } = {};
    filteredCalculators.forEach((calc) => {
      if (!groups[calc.category]) {
        groups[calc.category] = [];
      }
      groups[calc.category].push(calc);
    });
    return groups;
  }, [filteredCalculators]);

  const handleInputChange = useCallback((inputId: string, value: string | number | boolean) => {
    setCalculatorState((prev) => ({
      ...prev,
      [inputId]: value,
    }));
  }, []);

  const handleUnitChange = useCallback((inputId: string, unit: string) => {
    setUnitState((prev) => ({
      ...prev,
      [inputId]: unit,
    }));
  }, []);

  // Get the current unit for an input (default to conventional)
  const getInputUnit = useCallback((inputId: string): string => {
    if (unitOptions[inputId]) {
      return unitState[inputId] || "conventional";
    }
    return "conventional";
  }, [unitState]);

  // Get the display unit label for an input
  const getUnitLabel = useCallback((input: { id: string; unit?: string }): string => {
    const options = unitOptions[input.id];
    if (options) {
      const currentUnit = getInputUnit(input.id);
      return currentUnit === "si" ? options.si : options.conventional;
    }
    return input.unit || "";
  }, [getInputUnit]);

  // Get dynamic placeholder based on unit selection
  const getDynamicPlaceholder = useCallback((input: CalculatorInput): string => {
    const options = unitOptions[input.id];
    if (!options || !input.placeholder) return input.placeholder || "";
    const currentUnit = getInputUnit(input.id);
    const placeholderValue = parseFloat(input.placeholder);
    if (isNaN(placeholderValue)) return input.placeholder;
    if (currentUnit === "si") {
      const siValue = placeholderValue * options.conversionFactor;
      return siValue.toFixed(2);
    }
    return input.placeholder;
  }, [getInputUnit]);

  // Convert input value to conventional units for calculation
  const normalizeValue = useCallback((inputId: string, value: number): number => {
    const options = unitOptions[inputId];
    if (options && getInputUnit(inputId) === "si") {
      // Convert from SI to conventional
      return value / options.conversionFactor;
    }
    return value;
  }, [getInputUnit]);

  const handleCalculate = useCallback(() => {
    if (!selectedCalculator) return;

    try {
      let calculationResult: number | { [key: string]: number } | undefined;

      // Helper to get normalized value (always in conventional units)
      const getValue = (id: string) => {
        const raw = calculatorState[id] as number;
        return normalizeValue(id, raw);
      };

      // Call appropriate calculator function based on ID
      switch (selectedCalculator.id) {
        case "ckd-epi-creatinine":
          calculationResult = calc.ckdEpiCreatinine(
            getValue("creatinine"),
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            calculatorState.race as "Black" | "Other",
            "mg/dL"
          );
          break;

        case "cockcroft-gault":
          calculationResult = calc.cockcrofGault(
            getValue("creatinine"),
            calculatorState.age as number,
            calculatorState.weight as number,
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "schwartz-pediatric":
          calculationResult = calc.schwartzPediatric(
            getValue("creatinine"),
            calculatorState.height as number,
            "mg/dL"
          );
          break;

        case "kinetic-egfr":
          calculationResult = calc.kineticEgfr(
            getValue("preBUN"),
            getValue("postBUN"),
            getValue("preCreatinine"),
            getValue("postCreatinine"),
            calculatorState.weight as number,
            calculatorState.sessionTime as number,
            "mg/dL"
          );
          break;

        case "ckd-epi-cystatin-c":
          calculationResult = calc.ckdEpiCystatinC(
            getValue("creatinine"),
            calculatorState.cystatinC as number,
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "egfr-slope":
          calculationResult = calc.eGFRSlope(
            calculatorState.eGFRBaseline as number,
            calculatorState.eGFRFinal as number,
            calculatorState.timeYears as number
          );
          break;

        case "kfre":
          calculationResult = calc.kfre(
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            calculatorState.eGFR as number,
            calculatorState.acr as number,
            (calculatorState.acrUnit as "mg/g" | "mg/mmol") || "mg/g",
            (calculatorState.years as 2 | 5) || 5
          );
          break;

        case "fena":
          calculationResult = calc.fena(
            calculatorState.urineNa as number,
            getValue("plasmaCr"),
            calculatorState.plasmaNa as number,
            getValue("urineCr"),
            "mg/dL"
          );
          break;

        case "feurea":
          calculationResult = calc.feurea(
            getValue("urineUrea"),
            getValue("plasmaCr"),
            getValue("plasmaUrea"),
            getValue("urineCr"),
            "mg/dL"
          );
          break;

        case "anion-gap":
          calculationResult = calc.anionGap(
            calculatorState.sodium as number,
            calculatorState.chloride as number,
            calculatorState.bicarbonate as number
          );
          break;

        case "delta-gap":
          const deltaResult = calc.deltaGap(
            calculatorState.measuredAG as number,
            calculatorState.measuredHCO3 as number,
            calculatorState.normalAG as number,
            calculatorState.normalHCO3 as number
          );
          calculationResult = deltaResult.ratio;
          break;

        case "osmolal-gap":
          calculationResult = calc.osmolalGap(
            calculatorState.measuredOsmolality as number,
            calculatorState.sodium as number,
            getValue("glucose"),
            getValue("bun"),
            calculatorState.ethanol as number,
            "mg/dL",
            "mg/dL"
          );
          break;

        case "urine-anion-gap":
          calculationResult = calc.urineAnionGap(
            calculatorState.urineNa as number,
            calculatorState.urineK as number,
            calculatorState.urineCl as number
          );
          break;

        case "ttkg":
          calculationResult = calc.ttkg(
            calculatorState.urineK as number,
            calculatorState.plasmaK as number,
            calculatorState.urineOsm as number,
            calculatorState.plasmaOsm as number
          );
          break;

        case "water-deficit-hypernatremia":
          calculationResult = calc.waterDeficitHypernatremia(
            calculatorState.currentNa as number,
            calculatorState.targetNa as number,
            calculatorState.totalBodyWater as number
          );
          break;

        case "corrected-sodium-hyperglycemia":
          calculationResult = calc.correctedSodiumHyperglycemia(
            calculatorState.measuredNa as number,
            getValue("glucose"),
            "mg/dL"
          );
          break;

        case "sodium-correction-rate":
          calculationResult = calc.sodiumCorrectionRateHyponatremia(
            calculatorState.currentNa as number,
            calculatorState.targetNa as number,
            calculatorState.infusionNa as number,
            calculatorState.totalBodyWater as number,
            calculatorState.correctionHours as number
          );
          break;

        case "sodium-deficit":
          calculationResult = calc.sodiumDeficitHyponatremia(
            calculatorState.currentNa as number,
            calculatorState.targetNa as number,
            calculatorState.totalBodyWater as number
          );
          break;

        case "corrected-calcium":
          calculationResult = calc.correctedCalcium(
            getValue("measuredCa"),
            getValue("albumin"),
            "g/dL"
          );
          break;

        case "qtc-bazett":
          calculationResult = calc.qtcBazett(
            calculatorState.qtInterval as number,
            calculatorState.heartRate as number
          );
          break;

        case "uacr":
          calculationResult = calc.uacr(
            getValue("urineAlbumin"),
            calculatorState.urineCreatinine as number,
            "mg",
            "g"
          );
          break;

        case "upcr":
          calculationResult = calc.upcr(
            calculatorState.urineProtein as number,
            calculatorState.urineCreatinine as number
          );
          break;

        case "selectivity-index":
          // Selectivity Index = (Urine IgG / Plasma IgG) / (Urine Albumin / Plasma Albumin)
          const urineIgG = calculatorState.urineIgG as number;
          const plasmaIgG = calculatorState.plasmaIgG as number;
          const urineAlb = getValue("urineAlbumin");
          const plasmaAlb = getValue("plasmaAlbumin");
          calculationResult = Math.round(((urineIgG / plasmaIgG) / (urineAlb / plasmaAlb)) * 100) / 100;
          break;

        case "24h-protein":
          calculationResult = calc.upcr(
            calculatorState.spotProtein as number,
            calculatorState.spotCreatinine as number
          );
          break;

        case "igan-prediction":
          calculationResult = calc.iganPredictionTool(
            calculatorState.age as number,
            calculatorState.eGFR as number,
            calculatorState.map as number,
            calculatorState.proteinuria as number,
            parseInt(calculatorState.years as string) as 2 | 5 | 7
          );
          break;

        case "kt-v-daugirdas":
          calculationResult = calc.ktv(
            getValue("preBUN"),
            getValue("postBUN"),
            calculatorState.postWeight as number,
            calculatorState.sessionTime as number,
            calculatorState.ultrafiltration as number || 0,
            "mg/dL"
          );
          break;

        case "kt-v-peritoneal":
          calculationResult = calc.pdWeeklyKtv(
            calculatorState.dialysateUrea as number,
            getValue("plasmaUrea"),
            calculatorState.dialysateVolume as number,
            calculatorState.bodyWeight as number
          );
          break;

        case "creatinine-clearance-pd":
          // Simplified PD creatinine clearance calculation
          const dialysateCr = getValue("dialysateCreatinine");
          const plasmaCr = getValue("plasmaCreatinine");
          const dialVol = calculatorState.dialysateVolume as number;
          const bodyWt = calculatorState.bodyWeight as number;
          calculationResult = Math.round((dialysateCr / plasmaCr) * (dialVol / bodyWt) * 100) / 100;
          break;

        case "total-body-water":
          calculationResult = calc.totalBodyWaterWatson(
            calculatorState.weight as number,
            calculatorState.height as number,
            calculatorState.age as number,
            calculatorState.sex as "M" | "F"
          );
          break;

        case "urr":
          calculationResult = calc.urrHemodialysis(
            getValue("preBUN"),
            getValue("postBUN"),
            "mg/dL"
          );
          break;

        case "iron-deficit":
          calculationResult = calc.ironDeficitGanzoni(
            getValue("targetHemoglobin"),
            getValue("currentHemoglobin"),
            calculatorState.weight as number,
            calculatorState.sex as "M" | "F"
          );
          break;

        case "kdpi":
          const kdpiResult = calc.kdpi(
            calculatorState.donorAge as number,
            calculatorState.donorHeight as number,
            calculatorState.donorWeight as number,
            getValue("donorCreatinine"),
            (calculatorState.hypertensionDuration as "NO" | "0-5" | "6-10" | ">10") || "NO",
            (calculatorState.diabetesDuration as "NO" | "0-5" | "6-10" | ">10") || "NO",
            (calculatorState.causeOfDeath as "ANOXIA" | "CVA" | "HEAD_TRAUMA" | "CNS_TUMOR" | "OTHER") || "ANOXIA",
            calculatorState.isDCD === "YES",
            getInputUnit("donorCreatinine") === "SI" ? "μmol/L" : "mg/dL"
          );
          calculationResult = kdpiResult.kdpi;
          break;

        case "epts":
          calculationResult = calc.epts(
            calculatorState.recipientAge as number,
            Boolean(calculatorState.recipientDiabetes),
            Boolean(calculatorState.priorTransplant),
            calculatorState.yearsOnDialysis as number
          );
          break;

        case "tacrolimus-monitoring":
          calculationResult = calc.tacrolimusMonitoring(
            calculatorState.dailyDose as number,
            calculatorState.troughLevel as number
          );
          break;

        case "ascvd-risk":
          calculationResult = calc.ascvdRisk(
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            getValue("totalCholesterol"),
            getValue("hdl"),
            calculatorState.systolicBP as number,
            Boolean(calculatorState.treated),
            Boolean(calculatorState.diabetes),
            Boolean(calculatorState.smoker),
            calculatorState.race as "Black" | "White"
          );
          break;

        case "bmi":
          calculationResult = calc.bmi(
            calculatorState.weight as number,
            calculatorState.height as number,
            "cm"
          );
          break;

        case "bsa-dubois":
          calculationResult = calc.bsaDuBois(
            calculatorState.weight as number,
            calculatorState.height as number,
            "cm"
          );
          break;

        case "bsa-mosteller":
          calculationResult = calc.bsaMosteller(
            calculatorState.weight as number,
            calculatorState.height as number,
            "cm"
          );
          break;

        case "ideal-body-weight":
          calculationResult = calc.devineIdealBodyWeight(
            calculatorState.height as number,
            calculatorState.sex as "M" | "F",
            "cm"
          );
          break;

        case "lean-body-weight":
          calculationResult = calc.leanBodyWeight(
            calculatorState.weight as number,
            calculatorState.height as number,
            calculatorState.sex as "M" | "F",
            "cm"
          );
          break;

        case "adjusted-body-weight":
          calculationResult = calc.adjustedBodyWeight(
            calculatorState.actualWeight as number,
            calculatorState.idealWeight as number
          );
          break;

        case "ca-pho-product":
          calculationResult = calc.caPhoProduct(
            getValue("calcium"),
            getValue("phosphate"),
            "mg/dL",
            "mg/dL"
          );
          break;

        case "sledai-2k":
          calculationResult = calc.sledai2k(
            Boolean(calculatorState.seizures),
            Boolean(calculatorState.psychosis),
            Boolean(calculatorState.organicBrainSyndrome),
            Boolean(calculatorState.visualDisorder),
            Boolean(calculatorState.cranialNerveDisorder),
            Boolean(calculatorState.lupusHeadache),
            Boolean(calculatorState.cerebrovasitisAccident),
            Boolean(calculatorState.vasculitis),
            Boolean(calculatorState.arthritis),
            Boolean(calculatorState.myositis),
            Boolean(calculatorState.urinaryCasts),
            Boolean(calculatorState.proteinuria),
            Boolean(calculatorState.hematuria),
            Boolean(calculatorState.pyuria),
            Boolean(calculatorState.rash),
            Boolean(calculatorState.alopecia),
            Boolean(calculatorState.mucousalUlcers),
            Boolean(calculatorState.pleuritis),
            Boolean(calculatorState.pericarditis),
            Boolean(calculatorState.lowComplement),
            Boolean(calculatorState.elevatedDNA)
          );
          break;

        case "frail-scale":
          calculationResult = calc.frailScale(
            Boolean(calculatorState.fatigue),
            Boolean(calculatorState.resistance),
            Boolean(calculatorState.ambulation),
            Boolean(calculatorState.illness),
            Boolean(calculatorState.lossOfWeight)
          );
          break;

        case "prisma-7":
          calculationResult = calc.prisma7(
            Boolean(calculatorState.age85),
            Boolean(calculatorState.female),
            Boolean(calculatorState.generalHealth),
            Boolean(calculatorState.limitation),
            Boolean(calculatorState.falls),
            Boolean(calculatorState.memory),
            Boolean(calculatorState.helpNeeded)
          );
          break;

        case "curb-65":
          calculationResult = calc.curb65(
            Boolean(calculatorState.confusion),
            getValue("urineaNitrogen"),
            calculatorState.respiratoryRate as number,
            calculatorState.bloodPressureSystolic as number,
            calculatorState.bloodPressureDiastolic as number,
            calculatorState.age as number,
            "mg/dL"
          );
          break;

        case "roks":
          calculationResult = calc.roks(
            calculatorState.age as number,
            calculatorState.bmi as number,
            Boolean(calculatorState.maleGender),
            Boolean(calculatorState.previousStone),
            Boolean(calculatorState.familyHistory)
          );
          break;

        case "slicc-2012":
          calculationResult = calc.slicc2012(
            Boolean(calculatorState.acuteRash),
            Boolean(calculatorState.chronicRash),
            Boolean(calculatorState.oralUlcers),
            Boolean(calculatorState.alopecia),
            Boolean(calculatorState.photosensitivity),
            Boolean(calculatorState.arthritis),
            Boolean(calculatorState.serositis),
            Boolean(calculatorState.renal),
            Boolean(calculatorState.psychosis),
            Boolean(calculatorState.seizures),
            Boolean(calculatorState.hemolytic),
            Boolean(calculatorState.leukopenia),
            Boolean(calculatorState.thrombocytopenia),
            Boolean(calculatorState.ana),
            Boolean(calculatorState.antiDsDna),
            Boolean(calculatorState.antiSmRnp),
            Boolean(calculatorState.antiRoSsa),
            Boolean(calculatorState.antiLaSSb),
            Boolean(calculatorState.antiC1q),
            Boolean(calculatorState.directCoombs)
          );
          break;

        case "frax":
          const fraxResult = calc.fraxSimplified(
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            calculatorState.weight as number,
            calculatorState.height as number,
            Boolean(calculatorState.previousFracture),
            Boolean(calculatorState.parentHipFracture),
            Boolean(calculatorState.currentSmoking),
            Boolean(calculatorState.glucocorticoids),
            Boolean(calculatorState.rheumatoidArthritis),
            Boolean(calculatorState.secondaryOsteoporosis),
            Boolean(calculatorState.alcoholIntake),
            calculatorState.bmdTScore as number | undefined
          );
          calculationResult = fraxResult.majorFracture;
          break;

        case "banff-classification":
          const banffScores: calc.BanffScores = {
            i: parseInt(calculatorState.i as string) || 0,
            t: parseInt(calculatorState.t as string) || 0,
            v: parseInt(calculatorState.v as string) || 0,
            g: parseInt(calculatorState.g as string) || 0,
            ptc: parseInt(calculatorState.ptc as string) || 0,
            ci: parseInt(calculatorState.ci as string) || 0,
            ct: parseInt(calculatorState.ct as string) || 0,
            cv: parseInt(calculatorState.cv as string) || 0,
            cg: parseInt(calculatorState.cg as string) || 0,
            mm: parseInt(calculatorState.mm as string) || 0,
            ah: parseInt(calculatorState.ah as string) || 0,
            c4d: parseInt(calculatorState.c4d as string) || 0,
            dsaPositive: Boolean(calculatorState.dsaPositive),
          };
          const banffResult = calc.banffClassification(banffScores);
          calculationResult = banffResult.category;
          // Set a more detailed interpretation
          setResultInterpretation(
            `**Category ${banffResult.category}: ${banffResult.diagnosis}**\n\n` +
            `**Subtype:** ${banffResult.subtype}\n` +
            `**Severity:** ${banffResult.severity}\n\n` +
            `**Recommendations:**\n${banffResult.recommendations.map(r => "• " + r).join("\n")}`
          );
          setResult(banffResult.category);
          return; // Skip the default interpretation handling

        default:
          calculationResult = undefined;
      }

      if (calculationResult !== undefined) {
        const numResult = typeof calculationResult === "number" ? calculationResult : 0;
        setResult(numResult);
        setResultInterpretation(selectedCalculator.interpretation(numResult));
      }
    } catch (error) {
      console.error("Calculation error:", error);
      setResult(null);
      setResultInterpretation("Error in calculation. Please check your inputs.");
    }
  }, [selectedCalculator, calculatorState, normalizeValue]);

  const handleSelectCalculator = useCallback((calcId: string) => {
    setSelectedCalculatorId(calcId);
    setCalculatorState({});
    setUnitState({});
    setResult(null);
    setResultInterpretation("");
    setMobileMenuOpen(false);
    // Track recent calculator usage
    addToRecent(calcId);
    // Auto-scroll to top of calculator content area and scroll sidebar to show selected item
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Also scroll the main content area if it exists
      const mainContent = document.getElementById('calculator-content');
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // Scroll sidebar to show the selected calculator button within the sidebar scroll area
      const selectedButton = document.querySelector(`[data-calculator-id="${calcId}"]`) as HTMLElement;
      if (selectedButton) {
        // Find the scrollable sidebar container
        const sidebarScroll = selectedButton.closest('[data-radix-scroll-area-viewport]') || 
                              selectedButton.closest('.overflow-y-auto');
        if (sidebarScroll) {
          const buttonRect = selectedButton.getBoundingClientRect();
          const containerRect = sidebarScroll.getBoundingClientRect();
          const scrollTop = (sidebarScroll as HTMLElement).scrollTop;
          const targetScrollTop = scrollTop + buttonRect.top - containerRect.top - (containerRect.height / 2) + (buttonRect.height / 2);
          sidebarScroll.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
        }
      }
    }, 100);
  }, [addToRecent]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    setFocusedIndex(-1);
  }, []);

  // Keyboard navigation handler
  const handleKeyboardNavigation = useCallback((e: KeyboardEvent) => {
    // Only handle navigation when sidebar is focused or search input is focused
    const activeElement = document.activeElement;
    const isSearchFocused = activeElement === searchInputRef.current;
    const isSidebarFocused = activeElement?.closest('aside') || activeElement?.closest('[data-radix-dialog-content]');
    
    if (!isSearchFocused && !isSidebarFocused) return;
    
    const totalCalculators = filteredCalculators.length;
    if (totalCalculators === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = prev < totalCalculators - 1 ? prev + 1 : 0;
          // Scroll the focused item into view
          setTimeout(() => {
            const button = document.querySelector(`[data-calculator-index="${newIndex}"]`) as HTMLElement;
            button?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }, 0);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : totalCalculators - 1;
          // Scroll the focused item into view
          setTimeout(() => {
            const button = document.querySelector(`[data-calculator-index="${newIndex}"]`) as HTMLElement;
            button?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }, 0);
          return newIndex;
        });
        break;
      case 'Enter':
        if (focusedIndex >= 0 && focusedIndex < totalCalculators) {
          e.preventDefault();
          handleSelectCalculator(filteredCalculators[focusedIndex].id);
        }
        break;
      case 'Escape':
        if (searchQuery) {
          e.preventDefault();
          clearSearch();
        }
        break;
    }
  }, [filteredCalculators, focusedIndex, searchQuery, handleSelectCalculator, clearSearch]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  // Reset focused index when filtered calculators change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, selectedCategory]);

  // Check if input supports unit toggle
  const hasUnitToggle = (inputId: string): boolean => {
    return inputId in unitOptions;
  };

  const allRequiredFilled = selectedCalculator
    ? selectedCalculator.inputs
        .filter((input) => input.required)
        .every((input) => {
          // Skip unit selector inputs
          if (input.id.endsWith("Unit")) return true;
          return calculatorState[input.id] !== undefined && calculatorState[input.id] !== "";
        })
    : false;

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search calculators... (↑↓ to navigate)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 bg-secondary border-border"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-border">
        <Label className="text-xs font-medium text-muted-foreground mb-2 block">Filter by Category</Label>
        <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}>
          <SelectTrigger className="bg-secondary border-border text-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calculator List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          {/* Favorites Section */}
          {favoriteCalculators.length > 0 && !searchQuery && !selectedCategory && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>Favorites</span>
                <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">{favoriteCalculators.length}</span>
              </div>
              <div className="space-y-1">
                {favoriteCalculators.map((calc) => (
                  <button
                    key={`fav-${calc.id}`}
                    data-calculator-id={calc.id}
                    onClick={() => handleSelectCalculator(calc.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors group",
                      "hover:bg-accent hover:text-accent-foreground",
                      selectedCalculatorId === calc.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="break-words hyphens-auto pr-2" style={{ wordBreak: 'break-word' }}>{calc.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleFavorite(calc.id, e)}
                          className={cn(
                            "p-0.5 rounded hover:bg-background/50 transition-colors",
                            selectedCalculatorId === calc.id ? "text-primary-foreground" : "text-amber-500"
                          )}
                          title="Remove from favorites"
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </button>
                        <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-50" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Separator className="my-3" />
            </div>
          )}

          {/* Recent Calculators Section */}
          {recentCalculators.length > 0 && !searchQuery && !selectedCategory && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-blue-500 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Recent</span>
                <span className="ml-auto text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">{recentCalculators.length}</span>
              </div>
              <div className="space-y-1">
                {recentCalculators.map((calc) => (
                  <button
                    key={`recent-${calc.id}`}
                    data-calculator-id={calc.id}
                    onClick={() => handleSelectCalculator(calc.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors group",
                      "hover:bg-accent hover:text-accent-foreground",
                      selectedCalculatorId === calc.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="break-words hyphens-auto pr-2" style={{ wordBreak: 'break-word' }}>{calc.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleFavorite(calc.id, e)}
                          className={cn(
                            "p-0.5 rounded transition-colors",
                            favorites.includes(calc.id)
                              ? "text-amber-500" 
                              : "text-muted-foreground/50 hover:text-amber-500 sm:opacity-0 sm:group-hover:opacity-100"
                          )}
                          title={favorites.includes(calc.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star className={cn("w-3 h-3", favorites.includes(calc.id) && "fill-current")} />
                        </button>
                        <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-50" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Separator className="my-3" />
            </div>
          )}

          {/* Regular Calculator List */}
          {(() => {
            let globalIndex = 0;
            return Object.entries(groupedCalculators).map(([category, calcs]) => (
              <div key={category} className="mb-4">
                <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {categoryIcons[category] || <Calculator className="w-4 h-4" />}
                  <span className="truncate">{category.split(" & ")[0]}</span>
                  <span className="ml-auto text-[10px] bg-secondary px-1.5 py-0.5 rounded">{calcs.length}</span>
                </div>
                <div className="space-y-1">
                  {calcs.map((calc) => {
                    const currentIndex = globalIndex++;
                    const isFocused = focusedIndex === currentIndex;
                    const isFavorite = favorites.includes(calc.id);
                    return (
                      <button
                        key={calc.id}
                        data-calculator-id={calc.id}
                        data-calculator-index={currentIndex}
                        onClick={() => handleSelectCalculator(calc.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-colors group",
                          "hover:bg-accent hover:text-accent-foreground",
                          selectedCalculatorId === calc.id
                            ? "bg-primary text-primary-foreground"
                            : isFocused
                            ? "bg-accent text-accent-foreground ring-2 ring-primary ring-offset-1"
                            : "text-foreground"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="break-words hyphens-auto pr-2" style={{ wordBreak: 'break-word' }}>{calc.name}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => toggleFavorite(calc.id, e)}
                              className={cn(
                                "p-0.5 rounded transition-colors",
                                isFavorite 
                                  ? "text-amber-500" 
                                  : "text-muted-foreground/50 hover:text-amber-500 sm:opacity-0 sm:group-hover:opacity-100"
                              )}
                              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star className={cn("w-3 h-3", isFavorite && "fill-current")} />
                            </button>
                            <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-50" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
          
          {filteredCalculators.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No calculators found</p>
              <button onClick={clearSearch} className="text-primary text-sm mt-2 hover:underline">
                Clear search
              </button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Calculator Count */}
      <div className="p-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          {filteredCalculators.length} of {calculators.length} calculators
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          ↑↓ Navigate · Enter Select · Esc Clear
        </p>
      </div>
    </div>
  );

  // Inline Unit Toggle Component
  const InlineUnitToggle = ({ inputId }: { inputId: string }) => {
    const options = unitOptions[inputId];
    if (!options) return null;

    const currentUnit = getInputUnit(inputId);

    return (
      <div className="flex items-center gap-0.5 bg-muted rounded p-0.5">
        <button
          type="button"
          onClick={() => handleUnitChange(inputId, "conventional")}
          className={cn(
            "px-2 py-0.5 text-xs font-medium rounded transition-colors",
            currentUnit === "conventional"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {options.conventional}
        </button>
        <button
          type="button"
          onClick={() => handleUnitChange(inputId, "si")}
          className={cn(
            "px-2 py-0.5 text-xs font-medium rounded transition-colors",
            currentUnit === "si"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {options.si}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Calculator Navigation</SheetTitle>
                  <SheetDescription>Browse and select nephrology calculators by category</SheetDescription>
                </SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary">
                <Stethoscope className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">ASNRT Calculator</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Nephrology Clinical Tools</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 xl:w-80 border-r border-border h-[calc(100vh-4rem)] sticky top-16">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {!selectedCalculator ? (
            // Welcome Screen
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Welcome to ASNRT Calculator</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Select a calculator from the sidebar to begin. This dashboard includes {calculators.length} clinical calculators organized by category for nephrology practice.
                </p>
              </div>

              {/* Category Quick Access */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.slice(0, 9).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {categoryIcons[category] || <Calculator className="w-4 h-4" />}
                      </div>
                    </div>
                    <h3 className="font-medium text-sm">{category.split(" & ")[0]}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {calculators.filter((c) => c.category === category).length} calculators
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Calculator View
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Calculator Header */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{selectedCalculator.category}</span>
                </div>
                <h2 className="text-2xl font-bold">{selectedCalculator.name}</h2>
                <p className="text-muted-foreground mt-1">{selectedCalculator.description}</p>
              </div>

              {/* Input Card */}
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Input Values
                  </CardTitle>
                  <CardDescription>
                    Enter patient data. Toggle units inline for each input field.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCalculator.inputs
                      .filter((input) => !input.id.endsWith("Unit")) // Skip unit selector inputs
                      .map((input) => (
                      <div key={input.id} className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            {input.label}
                            {input.required && <span className="text-destructive">*</span>}
                          </Label>
                          {hasUnitToggle(input.id) && (
                            <InlineUnitToggle inputId={input.id} />
                          )}
                        </div>
                        
                        {input.type === "number" && (
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder={getDynamicPlaceholder(input)}
                              value={String(calculatorState[input.id] ?? "")}
                              onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value) || "")}
                              min={input.min}
                              max={input.max}
                              step={input.step}
                              className={hasUnitToggle(input.id) ? "" : "pr-16"}
                            />
                            {!hasUnitToggle(input.id) && input.unit && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                {input.unit}
                              </span>
                            )}
                          </div>
                        )}

                        {input.type === "select" && (
                          <Select
                            value={String(calculatorState[input.id] ?? "")}
                            onValueChange={(value) => handleInputChange(input.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {input.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {input.type === "checkbox" && (
                          <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                              checked={Boolean(calculatorState[input.id])}
                              onCheckedChange={(checked) => handleInputChange(input.id, checked)}
                            />
                            <Label htmlFor={input.id} className="text-sm font-normal cursor-pointer">
                              Yes
                            </Label>
                          </div>
                        )}

                        {input.type === "radio" && (
                          <div className="flex gap-4">
                            {input.options?.map((opt) => (
                              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={input.id}
                                  value={opt.value}
                                  checked={calculatorState[input.id] === opt.value}
                                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <Button
                    onClick={handleCalculate}
                    disabled={!allRequiredFilled}
                    className="w-full"
                    size="lg"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate
                  </Button>
                </CardContent>
              </Card>

              {/* Result Card */}
              {result !== null && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-4xl font-bold text-primary">
                        {typeof result === "number" ? result.toFixed(2) : result}
                      </p>
                      {selectedCalculator.resultUnit && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedCalculator.resultUnit}</p>
                      )}
                    </div>

                    {resultInterpretation && (
                      <Alert className="mt-4">
                        <Info className="h-4 w-4" />
                        <AlertDescription>{resultInterpretation}</AlertDescription>
                      </Alert>
                    )}

                    {/* Reference Ranges */}
                    {selectedCalculator.referenceRanges && selectedCalculator.referenceRanges.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          Reference Ranges
                        </p>
                        <div className="space-y-1">
                          {selectedCalculator.referenceRanges.map((range, idx) => {
                            const isInRange = typeof result === 'number' && (
                              (range.min !== undefined && range.max !== undefined && result >= range.min && result <= range.max) ||
                              (range.min !== undefined && range.max === undefined && result >= range.min) ||
                              (range.min === undefined && range.max !== undefined && result <= range.max)
                            );
                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between text-xs p-2 rounded ${
                                  isInRange ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
                                }`}
                              >
                                <span className={`font-medium ${isInRange ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {range.label}
                                  {isInRange && ' ✓'}
                                </span>
                                <span className="text-muted-foreground">
                                  {range.min !== undefined && range.max !== undefined
                                    ? `${range.min} - ${range.max} ${range.unit}`
                                    : range.min !== undefined
                                    ? `≥${range.min} ${range.unit}`
                                    : `≤${range.max} ${range.unit}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {selectedCalculator.referenceRanges.some(r => r.note) && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {selectedCalculator.referenceRanges.find(r => r.note)?.note}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Clinical Pearls */}
              {selectedCalculator.clinicalPearls.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Clinical Pearls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedCalculator.clinicalPearls.map((pearl, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary flex-shrink-0">•</span>
                          <span>{pearl}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* References */}
              {selectedCalculator.references.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">References</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {selectedCalculator.references.map((ref, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground">
                          {idx + 1}. {ref}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
