/**
 * ASNRT Nephrology Calculator Dashboard
 * Professional open-access calculator for nephrologists
 * 53 calculators organized by clinical category
 * Features: Light/Dark theme, seamless unit conversion, mobile-friendly
 */

import { useState, useMemo, useCallback } from "react";
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
  X
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculators, getCategories, getCalculatorById } from "@/lib/calculatorData";
import * as calc from "@/lib/calculators";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface CalculatorState {
  [key: string]: string | number | boolean;
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

// Global unit system state
type UnitSystem = "conventional" | "SI";

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCalculatorId, setSelectedCalculatorId] = useState<string | null>(null);
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({});
  const [result, setResult] = useState<number | null>(null);
  const [resultInterpretation, setResultInterpretation] = useState<string>("");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("conventional");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Get the appropriate unit label based on unit system
  const getUnitLabel = useCallback((input: { id: string; unit?: string }) => {
    if (!input.unit) return "";
    
    // Map input IDs to their unit conversions
    const unitMappings: { [key: string]: { conv: string; si: string } } = {
      creatinine: { conv: "mg/dL", si: "μmol/L" },
      preCreatinine: { conv: "mg/dL", si: "μmol/L" },
      postCreatinine: { conv: "mg/dL", si: "μmol/L" },
      plasmaCr: { conv: "mg/dL", si: "μmol/L" },
      urineCr: { conv: "mg/dL", si: "μmol/L" },
      donorCreatinine: { conv: "mg/dL", si: "μmol/L" },
      urineCreatinine: { conv: "g", si: "mg" },
      bun: { conv: "mg/dL", si: "mmol/L" },
      preBUN: { conv: "mg/dL", si: "mmol/L" },
      postBUN: { conv: "mg/dL", si: "mmol/L" },
      plasmaUrea: { conv: "mg/dL", si: "mmol/L" },
      urineUrea: { conv: "mg/dL", si: "mmol/L" },
      urineaNitrogen: { conv: "mg/dL", si: "mmol/L" },
      glucose: { conv: "mg/dL", si: "mmol/L" },
      albumin: { conv: "g/dL", si: "g/L" },
      calcium: { conv: "mg/dL", si: "mmol/L" },
      measuredCa: { conv: "mg/dL", si: "mmol/L" },
      phosphate: { conv: "mg/dL", si: "mmol/L" },
      totalCholesterol: { conv: "mg/dL", si: "mmol/L" },
      hdl: { conv: "mg/dL", si: "mmol/L" },
      height: { conv: "in", si: "cm" },
      donorHeight: { conv: "in", si: "cm" },
      weight: { conv: "lbs", si: "kg" },
      donorWeight: { conv: "lbs", si: "kg" },
      actualWeight: { conv: "lbs", si: "kg" },
      idealWeight: { conv: "lbs", si: "kg" },
      hemoglobin: { conv: "g/dL", si: "g/L" },
      targetHemoglobin: { conv: "g/dL", si: "g/L" },
      currentHemoglobin: { conv: "g/dL", si: "g/L" },
    };

    const mapping = unitMappings[input.id];
    if (mapping) {
      return unitSystem === "SI" ? mapping.si : mapping.conv;
    }
    
    return input.unit;
  }, [unitSystem]);

  // Convert input value based on unit system for calculation
  const normalizeValue = useCallback((inputId: string, value: number): number => {
    if (unitSystem === "conventional") return value;
    
    // SI to conventional conversions for calculation
    const conversions: { [key: string]: number } = {
      creatinine: 1 / 88.4,
      preCreatinine: 1 / 88.4,
      postCreatinine: 1 / 88.4,
      plasmaCr: 1 / 88.4,
      urineCr: 1 / 88.4,
      donorCreatinine: 1 / 88.4,
      bun: 1 / 0.357,
      preBUN: 1 / 0.357,
      postBUN: 1 / 0.357,
      plasmaUrea: 1 / 0.357,
      urineUrea: 1 / 0.357,
      urineaNitrogen: 1 / 0.357,
      glucose: 1 / 0.0555,
      albumin: 1 / 10,
      calcium: 4,
      measuredCa: 4,
      phosphate: 1 / 0.323,
      totalCholesterol: 1 / 0.0259,
      hdl: 1 / 0.0259,
      height: 1, // Already in cm for SI
      donorHeight: 1,
      weight: 1, // Already in kg for SI
      donorWeight: 1,
      actualWeight: 1,
      idealWeight: 1,
      hemoglobin: 1 / 10,
      targetHemoglobin: 1 / 10,
      currentHemoglobin: 1 / 10,
    };
    
    const factor = conversions[inputId];
    return factor ? value * factor : value;
  }, [unitSystem]);

  const handleCalculate = useCallback(() => {
    if (!selectedCalculator) return;

    try {
      let calculationResult: number | { [key: string]: number } | undefined;

      // Helper to get normalized value
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
            "mg/dL" // Always pass conventional after normalization
          );
          break;

        case "cockcroft-gault":
          calculationResult = calc.cockcrofGault(
            getValue("creatinine"),
            calculatorState.age as number,
            getValue("weight"),
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "schwartz-pediatric":
          calculationResult = calc.schwartzPediatric(
            getValue("creatinine"),
            getValue("height"),
            "mg/dL"
          );
          break;

        case "kinetic-egfr":
          calculationResult = calc.kineticEgfr(
            getValue("preBUN"),
            getValue("postBUN"),
            getValue("preCreatinine"),
            getValue("postCreatinine"),
            getValue("weight"),
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
            calculatorState.years as 2 | 5
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
            calculatorState.urineAlbumin as number,
            calculatorState.urineCreatinine as number,
            calculatorState.albuminUnit as "mg" | "μg",
            calculatorState.creatinineUnit as "g" | "mg"
          );
          break;

        case "upcr":
          calculationResult = calc.upcr(
            calculatorState.urineProtein as number,
            calculatorState.urineCreatinine as number,
            calculatorState.proteinUnit as "mg" | "g",
            calculatorState.creatinineUnit as "mg" | "g"
          );
          break;

        case "acr-from-pcr":
          calculationResult = calc.acrFromPcr(calculatorState.pcr as number);
          break;

        case "igan-prediction":
          calculationResult = calc.iganPredictionTool(
            calculatorState.age as number,
            calculatorState.eGFR as number,
            calculatorState.map as number,
            calculatorState.proteinuria as number,
            calculatorState.years as 2 | 5 | 7
          );
          break;

        case "ktv-hemodialysis":
          calculationResult = calc.ktv(
            getValue("preBUN"),
            getValue("postBUN"),
            getValue("weight"),
            calculatorState.sessionTime as number,
            "mg/dL"
          );
          break;

        case "total-body-water":
          calculationResult = calc.totalBodyWaterWatson(
            getValue("weight"),
            calculatorState.age as number,
            calculatorState.sex as "M" | "F"
          );
          break;

        case "hd-session-duration":
          calculationResult = calc.hemodialysisSessionDuration(
            calculatorState.targetKtV as number,
            getValue("preBUN"),
            getValue("postBUN"),
            getValue("weight"),
            "mg/dL"
          );
          break;

        case "pd-weekly-ktv":
          calculationResult = calc.pdWeeklyKtv(
            calculatorState.dailyDialysateUrea as number,
            calculatorState.plasmaUrea as number,
            calculatorState.dialysateVolume as number,
            calculatorState.totalBodyWater as number,
            calculatorState.residualKtv as number
          );
          break;

        case "residual-rkf-ktv":
          calculationResult = calc.residualKfKtv(
            calculatorState.ureaUrineClearance as number,
            calculatorState.totalBodyWater as number
          );
          break;

        case "equilibrated-ktv":
          calculationResult = calc.equilibratedKtv(
            calculatorState.spKtv as number,
            calculatorState.sessionTime as number
          );
          break;

        case "standard-ktv":
          calculationResult = calc.standardKtv(
            calculatorState.spKtv as number,
            calculatorState.residualKtv as number
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
            getValue("weight"),
            calculatorState.sex as "M" | "F"
          );
          break;

        case "kdpi":
          calculationResult = calc.kdpi(
            calculatorState.donorAge as number,
            getValue("donorHeight"),
            getValue("donorWeight"),
            getValue("donorCreatinine"),
            calculatorState.donorHypertension as boolean,
            calculatorState.donorDiabetes as boolean,
            calculatorState.donorAfricanAmerican as boolean,
            calculatorState.donorHepCPositive as boolean,
            calculatorState.causeOfDeathStroke as boolean,
            calculatorState.donorAfterCirculatoryDeath as boolean,
            "mg/dL"
          );
          break;

        case "epts":
          calculationResult = calc.epts(
            calculatorState.recipientAge as number,
            calculatorState.recipientDiabetes as boolean,
            calculatorState.priorTransplant as boolean,
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
            calculatorState.treated as boolean,
            calculatorState.diabetes as boolean,
            calculatorState.smoker as boolean,
            calculatorState.race as "Black" | "White"
          );
          break;

        case "bmi":
          calculationResult = calc.bmi(
            getValue("weight"),
            getValue("height"),
            "cm"
          );
          break;

        case "bsa-dubois":
          calculationResult = calc.bsaDuBois(
            getValue("weight"),
            getValue("height"),
            "cm"
          );
          break;

        case "bsa-mosteller":
          calculationResult = calc.bsaMosteller(
            getValue("weight"),
            getValue("height"),
            "cm"
          );
          break;

        case "devine-ibw":
          calculationResult = calc.devineIdealBodyWeight(
            getValue("height"),
            calculatorState.sex as "M" | "F",
            "cm"
          );
          break;

        case "lean-body-weight":
          calculationResult = calc.leanBodyWeight(
            getValue("weight"),
            getValue("height"),
            calculatorState.sex as "M" | "F",
            "cm"
          );
          break;

        case "adjusted-body-weight":
          calculationResult = calc.adjustedBodyWeight(
            getValue("actualWeight"),
            getValue("idealWeight")
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
            calculatorState.seizures as boolean,
            calculatorState.psychosis as boolean,
            calculatorState.organicBrainSyndrome as boolean,
            calculatorState.visualDisorder as boolean,
            calculatorState.cranialNerveDisorder as boolean,
            calculatorState.lupusHeadache as boolean,
            calculatorState.cerebrovasitisAccident as boolean,
            calculatorState.vasculitis as boolean,
            calculatorState.arthritis as boolean,
            calculatorState.myositis as boolean,
            calculatorState.urinaryCasts as boolean,
            calculatorState.proteinuria as boolean,
            calculatorState.hematuria as boolean,
            calculatorState.pyuria as boolean,
            calculatorState.rash as boolean,
            calculatorState.alopecia as boolean,
            calculatorState.mucousalUlcers as boolean,
            calculatorState.pleuritis as boolean,
            calculatorState.pericarditis as boolean,
            calculatorState.lowComplement as boolean,
            calculatorState.elevatedDNA as boolean
          );
          break;

        case "frail-scale":
          calculationResult = calc.frailScale(
            calculatorState.fatigue as boolean,
            calculatorState.resistance as boolean,
            calculatorState.ambulation as boolean,
            calculatorState.illness as boolean,
            calculatorState.lossOfWeight as boolean
          );
          break;

        case "prisma-7":
          calculationResult = calc.prisma7(
            calculatorState.age as boolean,
            calculatorState.female as boolean,
            calculatorState.generalHealth as boolean,
            calculatorState.limitation as boolean,
            calculatorState.falls as boolean,
            calculatorState.memory as boolean,
            calculatorState.helpNeeded as boolean
          );
          break;

        case "curb-65":
          calculationResult = calc.curb65(
            calculatorState.confusion as boolean,
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
            calculatorState.maleGender as boolean,
            calculatorState.previousStone as boolean,
            calculatorState.familyHistory as boolean
          );
          break;

        case "slicc-2012":
          calculationResult = calc.slicc2012(
            calculatorState.acuteRash as boolean,
            calculatorState.chronicRash as boolean,
            calculatorState.oralUlcers as boolean,
            calculatorState.alopecia as boolean,
            calculatorState.photosensitivity as boolean,
            calculatorState.arthritis as boolean,
            calculatorState.serositis as boolean,
            calculatorState.renal as boolean,
            calculatorState.psychosis as boolean,
            calculatorState.seizures as boolean,
            calculatorState.hemolytic as boolean,
            calculatorState.leukopenia as boolean,
            calculatorState.thrombocytopenia as boolean,
            calculatorState.ana as boolean,
            calculatorState.antiDsDna as boolean,
            calculatorState.antiSmRnp as boolean,
            calculatorState.antiRoSsa as boolean,
            calculatorState.antiLaSSb as boolean,
            calculatorState.antiC1q as boolean,
            calculatorState.directCoombs as boolean
          );
          break;

        case "banff-classification":
          setResultInterpretation(selectedCalculator.interpretation(0));
          setResult(0);
          return;

        case "statin-intensity":
          setResultInterpretation(selectedCalculator.interpretation(0));
          setResult(0);
          return;

        case "frax-simplified":
          const fraxResult = calc.fraxSimplified(
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            getValue("weight"),
            getValue("height"),
            calculatorState.previousFracture as boolean,
            calculatorState.parentHipFracture as boolean,
            calculatorState.currentSmoking as boolean,
            calculatorState.glucocorticoids as boolean,
            calculatorState.rheumatoidArthritis as boolean,
            calculatorState.secondaryOsteoporosis as boolean,
            calculatorState.alcoholIntake as boolean,
            calculatorState.bmdTScore as number | undefined
          );
          calculationResult = fraxResult.majorFracture;
          setResultInterpretation(
            `Major Osteoporotic Fracture: ${fraxResult.majorFracture}% | Hip Fracture: ${fraxResult.hipFracture}% - ` +
            selectedCalculator.interpretation(fraxResult.majorFracture)
          );
          break;

        default:
          calculationResult = 0;
      }

      if (typeof calculationResult === "number") {
        setResult(calculationResult);
        setResultInterpretation(selectedCalculator.interpretation(calculationResult));
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
    setResult(null);
    setResultInterpretation("");
    setMobileMenuOpen(false);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
  }, []);

  const allRequiredFilled = selectedCalculator
    ? selectedCalculator.inputs
        .filter((input) => input.required)
        .every((input) => calculatorState[input.id] !== undefined && calculatorState[input.id] !== "")
    : false;

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search calculators..."
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
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(groupedCalculators).map(([category, calcs]) => (
            <div key={category} className="mb-4">
              <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {categoryIcons[category] || <Calculator className="w-4 h-4" />}
                <span className="truncate">{category.split(" & ")[0]}</span>
                <span className="ml-auto text-[10px] bg-secondary px-1.5 py-0.5 rounded">{calcs.length}</span>
              </div>
              <div className="space-y-1">
                {calcs.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => handleSelectCalculator(calc.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      selectedCalculatorId === calc.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2">{calc.name}</span>
                      <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-50" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          
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
      </div>
    </div>
  );

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
            {/* Unit System Toggle */}
            <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setUnitSystem("conventional")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  unitSystem === "conventional"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Conventional
              </button>
              <button
                onClick={() => setUnitSystem("SI")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  unitSystem === "SI"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                SI Units
              </button>
            </div>

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

      {/* Mobile Unit Toggle */}
      <div className="sm:hidden border-b border-border bg-background p-2">
        <div className="flex items-center justify-center gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setUnitSystem("conventional")}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors",
              unitSystem === "conventional"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            Conventional Units
          </button>
          <button
            onClick={() => setUnitSystem("SI")}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors",
              unitSystem === "SI"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            SI Units
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 border-r border-border bg-card h-[calc(100vh-4rem)] sticky top-16">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="container py-6 max-w-4xl">
            {selectedCalculator ? (
              <div className="space-y-6">
                {/* Calculator Header */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        {categoryIcons[selectedCalculator.category]}
                        <span>{selectedCalculator.category}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">{selectedCalculator.name}</h2>
                      <p className="text-muted-foreground mt-1">{selectedCalculator.description}</p>
                    </div>
                  </div>
                </div>

                {/* Input Card */}
                <Card className="border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" />
                      Input Values
                    </CardTitle>
                    <CardDescription>
                      Enter patient data. Units: {unitSystem === "SI" ? "SI (International)" : "Conventional (US)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedCalculator.inputs.map((input) => (
                        <div key={input.id} className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            {input.label}
                            {input.required && <span className="text-destructive">*</span>}
                          </Label>
                          
                          {input.type === "number" && (
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder={input.placeholder}
                                value={String(calculatorState[input.id] ?? "")}
                                onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value) || "")}
                                min={input.min}
                                max={input.max}
                                step={input.step}
                                className="pr-16"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                {getUnitLabel(input)}
                              </span>
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
                                id={input.id}
                                checked={Boolean(calculatorState[input.id])}
                                onCheckedChange={(checked) => handleInputChange(input.id, checked === true)}
                              />
                              <Label htmlFor={input.id} className="text-sm font-normal cursor-pointer">
                                Yes
                              </Label>
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
            ) : (
              /* Welcome Screen */
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="p-4 rounded-full bg-primary/10 mb-6">
                  <Calculator className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to ASNRT Calculator</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Select a calculator from the sidebar to begin. This dashboard includes 53 clinical calculators 
                  organized by category for nephrology practice.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg">
                  {categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setMobileMenuOpen(true);
                      }}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-accent transition-colors"
                    >
                      {categoryIcons[cat]}
                      <span className="text-xs text-center">{cat.split(" & ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
