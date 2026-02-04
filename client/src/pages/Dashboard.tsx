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
  Clock,
  ArrowLeft,
  Copy,
  Check,
  ArrowLeftRight
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculators, getCategories, getCalculatorById, CalculatorInput } from "@/lib/calculatorData";
import * as calc from "@/lib/calculators";
import { getRecommendations } from '@/lib/clinicalRecommendations';
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import SearchInput from "@/components/SearchInput";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EGFRComparison } from "@/components/EGFRComparison";
import { getResultColorCoding } from "@/lib/resultColorCoding";
import { UnitConversionTooltip, hasUnitConversion } from "@/components/UnitConversionTooltip";
import ConversionReferenceCard from "@/components/ConversionReferenceCard";

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

// Category descriptions for clinical context
const categoryDescriptions: { [key: string]: string } = {
  "Kidney Function & CKD Risk": "Equations for estimating glomerular filtration rate (eGFR), creatinine clearance, and predicting progression to kidney failure. Essential for CKD staging and drug dosing.",
  "Acute Kidney Injury (AKI) Workup": "Diagnostic tools for evaluating acute kidney injury, including fractional excretion calculations and anion gap analysis to differentiate prerenal, intrinsic, and postrenal causes.",
  "Electrolytes & Acid-Base": "Calculators for sodium, potassium, and calcium disorders. Includes correction formulas for hyperglycemia, hypoalbuminemia, and tools for managing dysnatremias.",
  "Proteinuria & Glomerular Disease": "Tools for quantifying proteinuria, converting between uACR and uPCR, and risk stratification in glomerular diseases including IgA nephropathy.",
  "Dialysis Adequacy": "Comprehensive dialysis dosing calculators including Kt/V for hemodialysis and peritoneal dialysis, URR, and session duration planning.",
  "Transplantation": "Pre- and post-transplant assessment tools including KDPI, EPTS, Banff classification, and immunosuppressant monitoring.",
  "Cardiovascular Risk": "Cardiovascular risk assessment adapted for CKD patients, including ASCVD risk calculation and statin therapy guidance.",
  "Anthropometric & Body Composition": "Body composition calculators including BMI, BSA, ideal body weight, and adjusted body weight for medication dosing in obesity.",
  "CKD-Mineral Bone Disease": "Tools for managing mineral bone disorder in CKD, including calcium-phosphate product calculation.",
  "Systemic Diseases & Scores": "Disease activity scores and classification criteria for systemic conditions affecting the kidney, including lupus nephritis and frailty assessment.",
  "Bone & Fracture Risk": "Fracture risk assessment tools including FRAX for osteoporosis screening in CKD patients.",
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
  // UACR inputs
  urineAlbumin: { conventional: "mg", si: "μg", conversionFactor: 1000 },
  urineCreatinineUACR: { conventional: "g", si: "mg", conversionFactor: 1000 },
  // UPCR inputs
  urineProtein: { conventional: "mg", si: "g", conversionFactor: 0.001 },
  urineCreatinineUPCR: { conventional: "mg", si: "g", conversionFactor: 0.001 },
  calcium: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.25 },
  measuredCa: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.25 },
  phosphate: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.323 },
  totalCholesterol: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0259 },
  hdl: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0259 },
  hemoglobin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
  targetHemoglobin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
  currentHemoglobin: { conventional: "g/dL", si: "g/L", conversionFactor: 10 },
  cystatinC: { conventional: "mg/L", si: "μmol/L", conversionFactor: 0.0749 },
  acr: { conventional: "mg/g", si: "mg/mmol", conversionFactor: 0.113 },
  // ACR from PCR calculator - PCR: 1 g/g = 113 mg/mmol (1000 mg/g ÷ 8.84 mmol/g creatinine)
  pcr: { conventional: "g/g", si: "mg/mmol", conversionFactor: 113 },
  // 24-Hour Protein Excretion Estimator inputs
  // ratioValue: mg/mg is base unit, mg/g = mg/mg * 1000, mg/mmol = mg/mg * 113.12
  ratioValue: { conventional: "mg/mg", si: "mg/mmol", conversionFactor: 113.12 },
  proteinValue: { conventional: "mg/dL", si: "g/L", conversionFactor: 0.01 },
  creatinineValue: { conventional: "mg/dL", si: "mmol/L", conversionFactor: 0.0884 },
};

// BUN/Urea inputs that need 4-option toggle
const bunUreaInputIds = ["bun", "preBUN", "postBUN", "plasmaUrea", "urineUrea", "urineaNitrogen", "bunValue"];

// 4-option BUN/Urea toggle options
const bunUreaOptions = [
  { value: "BUN (mg/dL)", label: "BUN (mg/dL)", isBUN: true, unit: "mg/dL" },
  { value: "BUN (mmol/L)", label: "BUN (mmol/L)", isBUN: true, unit: "mmol/L" },
  { value: "Urea (mg/dL)", label: "Urea (mg/dL)", isBUN: false, unit: "mg/dL" },
  { value: "Urea (mmol/L)", label: "Urea (mmol/L)", isBUN: false, unit: "mmol/L" },
];

// Sortable Favorite Card Component for drag-and-drop
interface SortableFavoriteCardProps {
  calc: typeof calculators[0];
  categoryIcons: { [key: string]: React.ReactNode };
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

function SortableFavoriteCard({ calc, categoryIcons, onSelect, onToggleFavorite }: SortableFavoriteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: calc.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-card hover:bg-accent/50 border border-border hover:border-primary/30 rounded-xl p-4 text-left transition-all duration-200 hover:shadow-lg hover:shadow-primary/5",
        isDragging && "shadow-xl ring-2 ring-primary/30"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 rounded cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        title="Drag to reorder"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="4" cy="4" r="1.5" />
          <circle cx="12" cy="4" r="1.5" />
          <circle cx="4" cy="8" r="1.5" />
          <circle cx="12" cy="8" r="1.5" />
          <circle cx="4" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      </div>
      
      {/* Clickable Card Content */}
      <button
        onClick={() => onSelect(calc.id)}
        className="w-full text-left pl-6"
      >
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1 rounded bg-primary/10 text-primary">
            {categoryIcons[calc.category] || <Calculator className="w-4 h-4" />}
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {calc.category.split(" & ")[0]}
          </span>
        </div>
        
        {/* Calculator Name */}
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 pr-8">
          {calc.name}
        </h4>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {calc.description}
        </p>
        
        {/* Footer with result info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calculator className="w-3 h-3" />
            {calc.inputs.length} inputs
          </span>
          <span className="text-primary font-medium group-hover:underline">
            Calculate →
          </span>
        </div>
      </button>
      
      {/* Favorite Star */}
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => onToggleFavorite(calc.id, e)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onToggleFavorite(calc.id, e as unknown as React.MouseEvent); } }}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-amber-500/10 transition-colors z-10"
        title="Remove from favorites"
      >
        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCalculatorId, setSelectedCalculatorId] = useState<string | null>(null);
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({});
  const [unitState, setUnitState] = useState<UnitState>(() => {
    const saved = localStorage.getItem('nephrology-calculator-units');
    return saved ? JSON.parse(saved) : {};
  });
  const [result, setResult] = useState<number | { [key: string]: number } | null>(null);
  const [resultInterpretation, setResultInterpretation] = useState<string>("");
  const [banffResult, setBanffResult] = useState<calc.BanffResult | null>(null);
  const [kdpiResult, setKdpiResult] = useState<{ kdri: number; kdpi: number } | null>(null);
  const [mehranResult, setMehranResult] = useState<{
    totalScore: number;
    riskCategory: string;
    cinRisk: number;
    dialysisRisk: number;
    breakdown: { factor: string; points: number; present: boolean }[];
  } | null>(null);
  const [fraxResult, setFraxResult] = useState<{ majorFracture: number; hipFracture: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewingCategoryList, setViewingCategoryList] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showCategoryCustomizer, setShowCategoryCustomizer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clinicalRecommendation, setClinicalRecommendation] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showConversionCard, setShowConversionCard] = useState(false);
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

  // Save unit preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('nephrology-calculator-units', JSON.stringify(unitState));
  }, [unitState]);

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

  // Get favorite calculators - preserve order from favorites array
  const favoriteCalculators = useMemo(() => 
    favorites.map(id => calculators.find(c => c.id === id)).filter(Boolean) as typeof calculators,
    [favorites]
  );

  // DnD sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for favorites reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFavorites((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  // Category preference state with localStorage persistence
  const [categoryOrder, setCategoryOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('nephrology-calculator-category-order');
    return saved ? JSON.parse(saved) : [];
  });

  // Save category order to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('nephrology-calculator-category-order', JSON.stringify(categoryOrder));
  }, [categoryOrder]);

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

  // Helper function to get recommendation key based on calculator and result
  const getRecommendationKey = (calculatorId: string, result: number): string | null => {
    switch (calculatorId) {
      case "ckd-epi-creatinine":
        if (result >= 90) return "stage1";
        if (result >= 60) return "stage2";
        if (result >= 45) return "stage3a";
        if (result >= 30) return "stage3b";
        if (result >= 15) return "stage4";
        return "stage5";
      
      case "kfre":
        if (result < 10) return "low";
        if (result < 40) return "moderate";
        return "high";
      
      case "cin-mehran":
        if (result < 8) return "low";
        if (result < 16) return "moderate";
        if (result < 26) return "high";
        return "veryhigh";
      
      case "ascvd":
        if (result < 5) return "low";
        if (result < 7.5) return "borderline";
        if (result < 20) return "intermediate";
        return "high";
      
      default:
        return null;
    }
  };

  // Get recent calculators (excluding favorites to avoid duplication)
  const recentCalculators = useMemo(() => 
    calculators.filter(c => recentCalculatorIds.includes(c.id) && !favorites.includes(c.id)),
    [recentCalculatorIds, favorites]
  );

  const categories = useMemo(() => getCategories(), []);
  
  // Get sorted categories based on user preference
  const sortedCategories = useMemo(() => {
    if (categoryOrder.length === 0) return categories;
    const sorted = [...categoryOrder];
    categories.forEach(cat => {
      if (!sorted.includes(cat)) {
        sorted.push(cat);
      }
    });
    return sorted;
  }, [categories, categoryOrder]);
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
    // Handle ACR multi-unit placeholders for KFRE calculator
    if (selectedCalculatorId === "kfre" && input.id === "acr") {
      const currentAcrUnit = unitState.acr || "mg/g";
      // Typical moderately elevated ACR values for each unit
      // 300 mg/g = 33.9 mg/mmol = 0.3 mg/mg (A3 category)
      switch (currentAcrUnit) {
        case "mg/g":
          return "300";
        case "mg/mmol":
          return "34";
        case "mg/mg":
          return "0.3";
        default:
          return "300";
      }
    }
    
    // Define typical clinical values for common inputs (conventional | SI)
    // These represent typical or moderately abnormal values for clinical context
    const typicalValues: { [inputId: string]: { conventional: string; si: string } } = {
      // Creatinine: 1.2 mg/dL = 106 μmol/L (mildly elevated)
      creatinine: { conventional: "1.2", si: "106" },
      preCreatinine: { conventional: "1.2", si: "106" },
      postCreatinine: { conventional: "0.8", si: "71" },
      plasmaCr: { conventional: "1.0", si: "88" },
      urineCr: { conventional: "100", si: "8840" },
      donorCreatinine: { conventional: "0.9", si: "80" },
      // BUN: 20 mg/dL = 7.1 mmol/L (upper normal)
      bun: { conventional: "20", si: "7.1" },
      preBUN: { conventional: "60", si: "21" },
      postBUN: { conventional: "20", si: "7.1" },
      plasmaUrea: { conventional: "20", si: "7.1" },
      urineUrea: { conventional: "500", si: "178" },
      urineaNitrogen: { conventional: "12", si: "4.3" },
      // Glucose: 100 mg/dL = 5.6 mmol/L (fasting normal)
      glucose: { conventional: "100", si: "5.6" },
      // Albumin: 4.0 g/dL = 40 g/L (normal)
      albumin: { conventional: "4.0", si: "40" },
      // Calcium: 9.5 mg/dL = 2.4 mmol/L (normal)
      calcium: { conventional: "9.5", si: "2.4" },
      measuredCa: { conventional: "9.5", si: "2.4" },
      // Phosphate: 4.0 mg/dL = 1.3 mmol/L (normal)
      phosphate: { conventional: "4.0", si: "1.3" },
      // Cystatin C: 1.0 mg/L = 0.075 μmol/L (normal)
      cystatinC: { conventional: "1.0", si: "0.08" },
      // Hemoglobin: 12 g/dL = 120 g/L (lower normal)
      hemoglobin: { conventional: "12", si: "120" },
      targetHemoglobin: { conventional: "11", si: "110" },
      currentHemoglobin: { conventional: "9", si: "90" },
      // Cholesterol: 200 mg/dL = 5.2 mmol/L (borderline high)
      totalCholesterol: { conventional: "200", si: "5.2" },
      hdl: { conventional: "50", si: "1.3" },
      // ACR: 30 mg/g = 3.4 mg/mmol (A2 category - moderately increased)
      acr: { conventional: "30", si: "3.4" },
      // PCR: 0.5 g/g = 56.5 mg/mmol (mild proteinuria)
      pcr: { conventional: "0.5", si: "57" },
    };
    
    const typicalValue = typicalValues[input.id];
    if (typicalValue) {
      const currentUnit = getInputUnit(input.id);
      return currentUnit === "si" ? typicalValue.si : typicalValue.conventional;
    }
    
    // Handle BUN/Urea 4-option toggle placeholders
    if (bunUreaInputIds.includes(input.id)) {
      const bunUreaUnit = unitState[input.id] || "BUN (mg/dL)";
      // Typical pre-dialysis BUN: 60 mg/dL, post-dialysis: 20 mg/dL
      const isPreBUN = input.id === "preBUN";
      const baseBUN = isPreBUN ? 60 : 20; // mg/dL
      switch (bunUreaUnit) {
        case "BUN (mg/dL)":
          return String(baseBUN);
        case "BUN (mmol/L)":
          return (baseBUN * 0.357).toFixed(1);
        case "Urea (mg/dL)":
          return (baseBUN / 0.467).toFixed(0); // BUN to Urea
        case "Urea (mmol/L)":
          return ((baseBUN / 0.467) * 0.166).toFixed(1); // Urea mg/dL to mmol/L
        default:
          return String(baseBUN);
      }
    }
    
    // Fallback to original logic for other inputs
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
  }, [getInputUnit, selectedCalculatorId, unitState]);

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

      // Helper to get BUN value in mg/dL from 4-option toggle
      // Converts from BUN/Urea in different units to BUN in mg/dL
      const getBunValue = (inputId: string) => {
        const raw = calculatorState[inputId] as number;
        if (raw === undefined || raw === null || isNaN(raw)) return 0;
        
        const selectedUnit = unitState[`${inputId}_bunUrea`] || "BUN (mg/dL)";
        
        // Conversion factors:
        // BUN (mg/dL) -> BUN (mg/dL): 1
        // BUN (mmol/L) -> BUN (mg/dL): multiply by 2.8 (1 mmol/L BUN = 2.8 mg/dL)
        // Urea (mg/dL) -> BUN (mg/dL): divide by 2.14 (Urea = BUN × 2.14)
        // Urea (mmol/L) -> BUN (mg/dL): multiply by 2.8 / 2.14 = 1.308 (or divide by 0.357 then divide by 2.14)
        
        switch (selectedUnit) {
          case "BUN (mg/dL)":
            return raw;
          case "BUN (mmol/L)":
            return raw * 2.8; // Convert BUN mmol/L to BUN mg/dL
          case "Urea (mg/dL)":
            return raw / 2.14; // Convert Urea mg/dL to BUN mg/dL
          case "Urea (mmol/L)":
            return raw * 6.006; // Convert Urea mmol/L to BUN mg/dL (2.8 / 0.4665)
          default:
            return raw;
        }
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
            getBunValue("preBUN"),
            getBunValue("postBUN"),
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
            (unitState.acr as "mg/g" | "mg/mmol" | "mg/mg") || "mg/g",
            (calculatorState.years as 2 | 5) || 5
          );
          break;

        case "lund-malmo-revised":
          calculationResult = calc.lundMalmoRevised(
            getValue("creatinine"),
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "bis1-elderly":
          calculationResult = calc.bis1Elderly(
            getValue("creatinine"),
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            "mg/dL"
          );
          break;

        case "fas-full-age-spectrum":
          calculationResult = calc.fasFullAgeSpectrum(
            getValue("creatinine"),
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            "mg/dL"
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
          // getValue already normalizes to conventional units (mg/dL)
          // getBunValue handles BUN/Urea 4-option toggle conversion
          calculationResult = calc.osmolalGap(
            calculatorState.measuredOsmolality as number,
            calculatorState.sodium as number,
            getValue("glucose"),
            getBunValue("bun"),
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

        case "bun-creatinine-ratio":
          // getBunValue handles BUN/Urea 4-option toggle conversion to BUN mg/dL
          calculationResult = calc.bunCreatinineRatio(
            getBunValue("bunValue"),
            getValue("creatinine"),
            getInputUnit("creatinine") as "mg/dL" | "μmol/L"
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
          // getValue already normalizes to conventional units (mg/dL)
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
            getValue("urineCreatinineUACR"),
            getInputUnit("urineAlbumin") === "si" ? "μg" : "mg",
            getInputUnit("urineCreatinineUACR") === "si" ? "mg" : "g"
          );
          break;

        case "upcr":
          calculationResult = calc.upcr(
            getValue("urineProtein"),
            getValue("urineCreatinineUPCR"),
            getInputUnit("urineProtein") === "si" ? "g" : "mg",
            getInputUnit("urineCreatinineUPCR") === "si" ? "g" : "mg"
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

        case "acr-from-pcr":
          calculationResult = calc.acrFromPcr(
            getValue("pcr")
          );
          break;

        case "24-hour-protein": {
          const inputMode = (calculatorState.inputMode as string) || "ratio";
          const testType = (calculatorState.testType as string) || "pcr";
          console.log("24-hour-protein debug:", { inputMode, testType, calculatorState, unitState });
          
          let ratioMgPerMg = 0;
          
          if (inputMode === "ratio") {
            // Get ratio value and convert to mg/mg base unit
            const rawRatio = parseFloat(String(calculatorState.ratioValue)) || 0;
            const ratioUnit = unitState.ratioValue || "mg/mg";
            
            // Convert to mg/mg (base unit)
            if (ratioUnit === "mg/mg") {
              ratioMgPerMg = rawRatio;
            } else if (ratioUnit === "mg/g") {
              ratioMgPerMg = rawRatio / 1000; // mg/g to mg/mg
            } else if (ratioUnit === "mg/mmol") {
              ratioMgPerMg = rawRatio / 113.12; // mg/mmol to mg/mg
            } else if (ratioUnit === "mg/L") {
              ratioMgPerMg = rawRatio; // mg/L ratio is same as mg/mg (both in mg/L)
            }
            console.log("Using ratio mode, rawRatio:", rawRatio, "unit:", ratioUnit, "ratioMgPerMg:", ratioMgPerMg);
          } else {
            // Calculate from raw values
            // First convert protein to mg/L
            const rawProtein = parseFloat(String(calculatorState.proteinValue)) || 0;
            const proteinUnit = unitState.proteinValue || "mg/dL";
            let proteinMgL = rawProtein;
            if (proteinUnit === "mg/dL") {
              proteinMgL = rawProtein * 10; // mg/dL to mg/L
            } else if (proteinUnit === "g/L") {
              proteinMgL = rawProtein * 1000; // g/L to mg/L
            }
            // proteinUnit === "mg/L" stays as is
            
            // Convert creatinine to mg/L
            const rawCreatinine = parseFloat(String(calculatorState.creatinineValue)) || 0;
            const creatinineUnit = unitState.creatinineValue || "mg/dL";
            let creatinineMgL = rawCreatinine;
            if (creatinineUnit === "mg/dL") {
              creatinineMgL = rawCreatinine * 10; // mg/dL to mg/L
            } else if (creatinineUnit === "mmol/L") {
              creatinineMgL = rawCreatinine * 113.12; // mmol/L to mg/L (MW creatinine = 113.12)
            }
            
            // Calculate ratio in mg/mg (which equals mg/L / mg/L)
            ratioMgPerMg = creatinineMgL > 0 ? proteinMgL / creatinineMgL : 0;
            console.log("Using raw mode, protein:", proteinMgL, "mg/L, creatinine:", creatinineMgL, "mg/L, ratioMgPerMg:", ratioMgPerMg);
          }
          
          // PCR/ACR in mg/mg equals estimated 24-hour protein/albumin excretion in g/day
          calculationResult = ratioMgPerMg;
          console.log("Final result:", calculationResult, "g/day, testType:", testType);
          break;
        }

        case "ktv-hemodialysis":
          // getBunValue handles BUN/Urea 4-option toggle conversion to BUN mg/dL
          calculationResult = calc.ktv(
            getBunValue("preBUN"),
            getBunValue("postBUN"),
            calculatorState.postWeight as number,
            calculatorState.sessionTime as number,
            calculatorState.ultrafiltration as number || 0,
            "mg/dL" // Always mg/dL since getBunValue converts to BUN mg/dL
          );
          break;

        case "hd-session-duration":
          calculationResult = calc.hemodialysisSessionDuration(
            calculatorState.targetKtV as number,
            calculatorState.dialyzerClearance as number,
            calculatorState.totalBodyWater as number
          );
          break;

        case "pd-weekly-ktv":
          calculationResult = calc.pdWeeklyKtv(
            calculatorState.dailyDialysateUrea as number,
            calculatorState.plasmaUrea as number,
            calculatorState.dialysateVolume as number,
            calculatorState.totalBodyWater as number,
            calculatorState.residualKtv as number || 0
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
            4, // Default 4-hour session for standard Kt/V calculation
            calculatorState.residualKtv as number || 0
          );
          break;

        case "devine-ibw":
          calculationResult = calc.devineIdealBodyWeight(
            calculatorState.height as number,
            calculatorState.sex as "M" | "F",
            (calculatorState.heightUnit as "cm" | "in") || "cm"
          );
          break;

        case "kt-v-daugirdas":
          // getBunValue handles BUN/Urea 4-option toggle conversion to BUN mg/dL
          calculationResult = calc.ktv(
            getBunValue("preBUN"),
            getBunValue("postBUN"),
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
          // getBunValue handles BUN/Urea 4-option toggle conversion to BUN mg/dL
          calculationResult = calc.urrHemodialysis(
            getBunValue("preBUN"),
            getBunValue("postBUN"),
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

        case "kdpi": {
          const kdpiCalcResult = calc.kdpi(
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
          setKdpiResult(kdpiCalcResult);
          setResult(kdpiCalcResult.kdpi);
          // Generate interpretation based on KDPI value
          let kdpiInterpretation = "";
          if (kdpiCalcResult.kdpi <= 20) {
            kdpiInterpretation = "Low risk donor kidney. Expected to have better long-term graft survival.";
          } else if (kdpiCalcResult.kdpi <= 85) {
            kdpiInterpretation = "Standard criteria donor kidney. Acceptable for most recipients.";
          } else {
            kdpiInterpretation = "High KDPI (≥85%). Consider for expanded criteria donor (ECD) allocation. May be suitable for older recipients or those with limited life expectancy.";
          }
          setResultInterpretation(kdpiInterpretation);
          return;
        }

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
          // getBunValue handles BUN/Urea 4-option toggle conversion to BUN mg/dL
          calculationResult = calc.curb65(
            Boolean(calculatorState.confusion),
            getBunValue("urineaNitrogen"),
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

        case "frax-simplified": {
          const fraxCalcResult = calc.fraxSimplified(
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
          setFraxResult(fraxCalcResult);
          setResult(fraxCalcResult.majorFracture);
          setResultInterpretation('');
          return;
        }

        case "banff-classification":
          console.log('Banff calculation starting...');
          console.log('calculatorState:', JSON.stringify(calculatorState));
          const banffScores: calc.BanffScores = {
            glomeruli: parseFloat(calculatorState.glomeruli as string) || 10,
            arteries: parseFloat(calculatorState.arteries as string) || 2,
            i: parseFloat(calculatorState.i as string) || 0,
            t: parseFloat(calculatorState.t as string) || 0,
            v: parseFloat(calculatorState.v as string) || 0,
            g: parseFloat(calculatorState.g as string) || 0,
            ptc: parseFloat(calculatorState.ptc as string) || 0,
            ci: parseFloat(calculatorState.ci as string) || 0,
            ct: parseFloat(calculatorState.ct as string) || 0,
            cv: parseFloat(calculatorState.cv as string) || 0,
            cg: parseFloat(calculatorState.cg as string) || 0,
            ti: parseFloat(calculatorState.ti as string) || 0,
            iIfta: parseFloat(calculatorState.iIfta as string) || 0,
            tIfta: parseFloat(calculatorState.tIfta as string) || 0,
            ah: parseFloat(calculatorState.ah as string) || 0,
            c4d: parseInt(calculatorState.c4d as string) || 0,
            dsa: (calculatorState.dsa as string) || 'negative',
          };
          console.log('banffScores:', JSON.stringify(banffScores));
          const banffResultData = calc.banffClassification(banffScores);
          console.log('banffResultData:', JSON.stringify(banffResultData));
          setBanffResult(banffResultData);
          console.log('setBanffResult called');
          setResult(null); // Banff uses custom display, not numeric result
          setResultInterpretation('');
          return; // Skip the default interpretation handling


        // Contrast-Induced Nephropathy Risk Calculator
        case "cin-mehran-score": {
          // Calculate Mehran score based on risk factors with detailed breakdown
          const breakdown: { factor: string; points: number; present: boolean }[] = [];
          let mehranScore = 0;
          
          // Hypotension: 5 points
          const hasHypotension = Boolean(calculatorState.hypotension);
          breakdown.push({ factor: 'Hypotension (SBP <80 mmHg for ≥1 hr requiring inotropes)', points: 5, present: hasHypotension });
          if (hasHypotension) mehranScore += 5;
          
          // IABP: 5 points
          const hasIABP = Boolean(calculatorState.iabp);
          breakdown.push({ factor: 'Intra-aortic balloon pump (IABP)', points: 5, present: hasIABP });
          if (hasIABP) mehranScore += 5;
          
          // CHF: 5 points
          const hasCHF = Boolean(calculatorState.chf);
          breakdown.push({ factor: 'Congestive heart failure (NYHA III-IV or pulmonary edema)', points: 5, present: hasCHF });
          if (hasCHF) mehranScore += 5;
          
          // Age >75: 4 points
          const hasAge = Boolean(calculatorState.age);
          breakdown.push({ factor: 'Age >75 years', points: 4, present: hasAge });
          if (hasAge) mehranScore += 4;
          
          // Anemia: 3 points
          const hasAnemia = Boolean(calculatorState.anemia);
          breakdown.push({ factor: 'Anemia (Hct <39% for men, <36% for women)', points: 3, present: hasAnemia });
          if (hasAnemia) mehranScore += 3;
          
          // Diabetes: 3 points
          const hasDiabetes = Boolean(calculatorState.diabetes);
          breakdown.push({ factor: 'Diabetes mellitus', points: 3, present: hasDiabetes });
          if (hasDiabetes) mehranScore += 3;
          
          // Contrast volume: 1 point per 100cc
          const contrastVol = calculatorState.contrastVolume as number || 0;
          const contrastPoints = Math.floor(contrastVol / 100);
          breakdown.push({ factor: `Contrast volume (${contrastVol} mL = ${contrastPoints} pts)`, points: contrastPoints, present: contrastPoints > 0 });
          mehranScore += contrastPoints;
          
          // eGFR points: 2 points if 40-60, 4 points if 20-40, 6 points if <20
          const cinEgfr = calculatorState.egfr as number || 60;
          let egfrPoints = 0;
          let egfrLabel = '';
          if (cinEgfr < 20) {
            egfrPoints = 6;
            egfrLabel = `eGFR <20 mL/min (${cinEgfr})`;
          } else if (cinEgfr < 40) {
            egfrPoints = 4;
            egfrLabel = `eGFR 20-39 mL/min (${cinEgfr})`;
          } else if (cinEgfr < 60) {
            egfrPoints = 2;
            egfrLabel = `eGFR 40-59 mL/min (${cinEgfr})`;
          } else {
            egfrLabel = `eGFR ≥60 mL/min (${cinEgfr})`;
          }
          breakdown.push({ factor: egfrLabel, points: egfrPoints, present: egfrPoints > 0 });
          mehranScore += egfrPoints;
          
          // SCr >1.5: 4 points (only if eGFR not provided)
          const cinScr = calculatorState.creatinine as number || 1.0;
          if (!calculatorState.egfr && cinScr > 1.5) {
            breakdown.push({ factor: `Serum Creatinine >1.5 mg/dL (${cinScr})`, points: 4, present: true });
            mehranScore += 4;
          }
          
          // Determine risk category and CIN/dialysis risks
          let riskCategory = '';
          let cinRisk = 0;
          let dialysisRisk = 0;
          if (mehranScore <= 5) {
            riskCategory = 'Low Risk';
            cinRisk = 7.5;
            dialysisRisk = 0.04;
          } else if (mehranScore <= 10) {
            riskCategory = 'Moderate Risk';
            cinRisk = 14.0;
            dialysisRisk = 0.12;
          } else if (mehranScore <= 15) {
            riskCategory = 'High Risk';
            cinRisk = 26.1;
            dialysisRisk = 1.09;
          } else {
            riskCategory = 'Very High Risk';
            cinRisk = 57.3;
            dialysisRisk = 12.6;
          }
          
          setMehranResult({
            totalScore: mehranScore,
            riskCategory,
            cinRisk,
            dialysisRisk,
            breakdown
          });
          setResult(mehranScore);
          setResultInterpretation('');
          return;
        }

        default:
          calculationResult = undefined;
      }

      if (calculationResult !== undefined) {
        // For corrected-calcium, pass the object directly
        if (selectedCalculator.id === "corrected-calcium" && typeof calculationResult === "object") {
          setResult(calculationResult);
          const numResult = (calculationResult as any).mgDl;
          setResultInterpretation(selectedCalculator.interpretation(numResult));
        } else {
          const numResult = typeof calculationResult === "number" ? calculationResult : 0;
          setResult(numResult);
          setResultInterpretation(selectedCalculator.interpretation(numResult));
        }
      }
    } catch (error) {
      console.error("Calculation error:", error);
      setResult(null);
      setResultInterpretation("Error in calculation. Please check your inputs.");
    }
  }, [selectedCalculator, calculatorState, normalizeValue]);

  const handleSelectCalculator = useCallback((calcId: string) => {
    setSelectedCalculatorId(calcId);
    // Initialize calculator state with default values for score inputs
    const calc = calculators.find(c => c.id === calcId);
    const initialState: CalculatorState = {};
    if (calc) {
      calc.inputs.forEach(input => {
        if (input.type === 'score') {
          initialState[input.id] = input.default ?? 0;
        } else if (input.default !== undefined) {
          initialState[input.id] = input.default;
        }
      });
    }
    setCalculatorState(initialState);
    // Note: Do NOT reset unitState here - we want to preserve unit preferences across calculator switches
    setResult(null);
    setResultInterpretation("");
    setBanffResult(null);
    setKdpiResult(null);
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

  // Keyboard navigation disabled to prevent search input focus loss on mobile
  // Users can click directly on calculators instead

  // Reset focused index when filtered calculators change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [selectedCategory]);

  // Check if input supports unit toggle
  const hasUnitToggle = (inputId: string): boolean => {
    // For 24-hour-protein calculator, check multi-unit options
    if (selectedCalculatorId === "24-hour-protein") {
      const multiUnitIds = ["ratioValue", "proteinValue", "creatinineValue"];
      if (multiUnitIds.includes(inputId)) return true;
    }
    // Check if this is a BUN/Urea input that needs 4-option toggle
    if (bunUreaInputIds.includes(inputId)) return true;
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

  // Sidebar content - using useMemo to prevent recreation on every render
  const sidebarContent = useMemo(() => (
      <div className="h-full flex flex-col">
      {/* Search - Using separate memoized component to prevent iOS focus loss */}
      <div className="sticky top-0 z-10 p-4 border-b border-border bg-background">
        <SearchInput onSearchChange={setSearchQuery} placeholder="Search calculators..." />
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
                        <span
                          onClick={(e) => toggleFavorite(calc.id, e)}
                          className={cn(
                            "p-0.5 rounded hover:bg-background/50 transition-colors cursor-pointer",
                            selectedCalculatorId === calc.id ? "text-primary-foreground" : "text-amber-500"
                          )}
                          title="Remove from favorites"
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </span>
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
                        <span
                          onClick={(e) => toggleFavorite(calc.id, e)}
                          className={cn(
                            "p-0.5 rounded transition-colors cursor-pointer",
                            favorites.includes(calc.id)
                              ? "text-amber-500" 
                              : "text-muted-foreground/50 hover:text-amber-500 sm:opacity-0 sm:group-hover:opacity-100"
                          )}
                          title={favorites.includes(calc.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star className={cn("w-3 h-3", favorites.includes(calc.id) && "fill-current")} />
                        </span>
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
                            <span
                              onClick={(e) => toggleFavorite(calc.id, e)}
                              className={cn(
                                "p-0.5 rounded transition-colors cursor-pointer",
                                isFavorite 
                                  ? "text-amber-500" 
                                  : "text-muted-foreground/50 hover:text-amber-500 sm:opacity-0 sm:group-hover:opacity-100"
                              )}
                              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star className={cn("w-3 h-3", isFavorite && "fill-current")} />
                            </span>
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
  ), [selectedCategory, categories, favoriteCalculators, recentCalculators, groupedCalculators, filteredCalculators, selectedCalculatorId, focusedIndex, favorites, handleSelectCalculator, toggleFavorite]);

  // Inline Unit Toggle Component
  // Multi-option unit definitions for calculators with more than 2 unit options
  const multiUnitOptions: { [inputId: string]: string[] } = {
    ratioValue: ["mg/mg", "mg/g", "mg/mmol", "mg/L"],
    proteinValue: ["mg/dL", "g/L", "mg/L"],
    creatinineValue: ["mg/dL", "mmol/L"],
    // ACR for KFRE calculator - mg/g is most common, mg/mmol is SI, mg/mg is ratio
    acr: ["mg/g", "mg/mmol", "mg/mg"],
  };

  const InlineUnitToggle = ({ inputId }: { inputId: string }) => {
    // Check if this input has multi-unit options
    // For 24-hour-protein calculator or ACR in KFRE
    const hasMultiUnitOptions = 
      (selectedCalculatorId === "24-hour-protein" && multiUnitOptions[inputId]) ||
      (selectedCalculatorId === "kfre" && inputId === "acr");
    
    if (hasMultiUnitOptions && multiUnitOptions[inputId]) {
      const options = multiUnitOptions[inputId];
      const currentUnit = unitState[inputId] || options[0];
      
      return (
        <div className="flex items-center gap-0.5 bg-muted rounded p-0.5">
          {options.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => setUnitState(prev => ({ ...prev, [inputId]: unit }))}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded transition-colors",
                currentUnit === unit
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {unit}
            </button>
          ))}
        </div>
      );
    }

    // Check if this is a BUN/Urea input that needs 4-option toggle
    if (bunUreaInputIds.includes(inputId)) {
      const currentBunUreaUnit = unitState[`${inputId}_bunUrea`] || "BUN (mg/dL)";
      
      return (
        <div className="flex items-center gap-0.5 bg-muted rounded p-0.5 flex-wrap">
          {bunUreaOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setUnitState(prev => ({ ...prev, [`${inputId}_bunUrea`]: option.value }))}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded transition-colors",
                currentBunUreaUnit === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      );
    }

    // Default 2-option toggle for other calculators
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
              <SheetContent side="left" className="w-80 p-0 max-h-screen overflow-y-auto">
                <SheetHeader className="sr-only">
                  <SheetTitle>Calculator Navigation</SheetTitle>
                  <SheetDescription>Browse and select nephrology calculators by category</SheetDescription>
                </SheetHeader>
                {sidebarContent}
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <img 
                src="/images/asnrt-logo.webp" 
                alt="ASNRT Logo" 
                className="w-10 h-10 object-contain"
              />
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
          {sidebarContent}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {viewingCategoryList ? (
            // Category List View
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-sm mb-6">
                <button
                  onClick={() => {
                    setViewingCategoryList(null);
                    setSelectedCategory(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                >
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                  Dashboard
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                <span className="text-foreground font-medium">
                  {viewingCategoryList}
                </span>
              </nav>

              {/* Category Header */}
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                    {categoryIcons[viewingCategoryList] || <Calculator className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{viewingCategoryList}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {calculators.filter(c => c.category === viewingCategoryList).length} calculators available
                    </p>
                    {categoryDescriptions[viewingCategoryList] && (
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {categoryDescriptions[viewingCategoryList]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Calculator List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {calculators
                  .filter(c => c.category === viewingCategoryList)
                  .map((calc) => (
                    <button
                      key={calc.id}
                      onClick={() => {
                        setSelectedCalculatorId(calc.id);
                        setViewingCategoryList(null);
                        setSelectedCategory(viewingCategoryList);
                        addToRecent(calc.id);
                        setResult(null);
                        setCalculatorState({});
                      }}
                      className="p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all text-left group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">
                            {calc.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {calc.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            onClick={(e) => toggleFavorite(calc.id, e)}
                            className="p-1 rounded hover:bg-background/50 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleFavorite(calc.id, e as unknown as React.MouseEvent);
                              }
                            }}
                          >
                            <Star
                              className={cn(
                                "w-4 h-4 transition-colors",
                                favorites.includes(calc.id)
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-muted-foreground hover:text-yellow-500"
                              )}
                            />
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ) : !selectedCalculator ? (
            // Welcome Screen
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
                  <img 
                    src="/images/asnrt-logo.webp" 
                    alt="ASNRT Logo" 
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-3">Welcome to ASNRT Calculator</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Select a calculator from the sidebar to begin. This dashboard includes {calculators.length} clinical calculators organized by category for nephrology practice.
                </p>
                <Button 
                  onClick={() => setShowComparison(!showComparison)}
                  variant={showComparison ? "default" : "outline"}
                  className="mb-8"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  {showComparison ? "Hide eGFR Comparison" : "Compare eGFR Equations"}
                </Button>
              </div>

              {/* Favorite Calculators Section with Drag-and-Drop */}
              {favoriteCalculators.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    <h3 className="text-lg font-semibold">Your Favorites</h3>
                    <span className="text-sm text-muted-foreground">({favoriteCalculators.length})</span>
                    <span className="text-xs text-muted-foreground ml-2">• Drag to reorder</span>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={favorites}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favoriteCalculators.map((calc) => (
                          <SortableFavoriteCard
                            key={calc.id}
                            calc={calc}
                            categoryIcons={categoryIcons}
                            onSelect={handleSelectCalculator}
                            onToggleFavorite={toggleFavorite}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* eGFR Comparison Mode */}
              {showComparison && (
                <div className="mb-8">
                  <EGFRComparison onClose={() => setShowComparison(false)} />
                </div>
              )}

              {/* Category Quick Access Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {showAllCategories ? "All Categories" : "Browse by Category"}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant={showConversionCard ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowConversionCard(!showConversionCard)}
                    className="text-sm"
                  >
                    <ArrowLeftRight className="w-4 h-4 mr-1" />
                    {showConversionCard ? "Hide Unit Converter" : "Unit Conversion Reference"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCategoryCustomizer(!showCategoryCustomizer)}
                    className="text-primary hover:text-primary/80"
                    title="Customize category order"
                  >
                    ⚙️ Customize
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="text-primary hover:text-primary/80"
                  >
                    {showAllCategories ? "Show Less" : `View All ${categories.length} Categories`}
                    <ChevronRight className={cn("w-4 h-4 ml-1 transition-transform", showAllCategories && "rotate-90")} />
                  </Button>
                </div>
              </div>

              {/* Category Customizer Modal */}
              {showCategoryCustomizer && (
                <Card className="mb-6 border-primary/50 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Customize Category Order</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCategoryCustomizer(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      Drag categories to reorder them. Your preferences will be saved automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sortedCategories.map((category, index) => (
                      <div
                        key={category}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="p-1 rounded text-muted-foreground">::</div>
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            {categoryIcons[category] || <Calculator className="w-4 h-4" />}
                          </div>
                          <span className="text-sm font-medium">{category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (index > 0) {
                                const newOrder = [...sortedCategories];
                                [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                setCategoryOrder(newOrder);
                              }
                            }}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (index < sortedCategories.length - 1) {
                                const newOrder = [...sortedCategories];
                                [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                setCategoryOrder(newOrder);
                              }
                            }}
                            disabled={index === sortedCategories.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            ↓
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCategoryOrder([]);
                      }}
                      className="w-full mt-4"
                    >
                      Reset to Default
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(showAllCategories ? sortedCategories : sortedCategories.slice(0, 9)).map((category) => {
                  const categoryCalculators = calculators.filter((c) => c.category === category);
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setViewingCategoryList(category);
                        setSelectedCategory(category);
                      }}
                      className="p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {categoryIcons[category] || <Calculator className="w-4 h-4" />}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-medium text-sm">{category.split(" & ")[0]}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {categoryCalculators.length} calculators
                      </p>
                      {showAllCategories && categoryDescriptions[category] && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {categoryDescriptions[category]}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Unit Conversion Reference Card - At Bottom */}
              {showConversionCard && (
                <div className="mt-8">
                  <ConversionReferenceCard onClose={() => setShowConversionCard(false)} />
                </div>
              )}
            </div>
          ) : (
            // Calculator View
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setSelectedCalculatorId(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                >
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                  Dashboard
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                <button
                  onClick={() => {
                    setViewingCategoryList(selectedCalculator.category);
                    setSelectedCategory(selectedCalculator.category);
                    setSelectedCalculatorId(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {selectedCalculator.category}
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
                  {selectedCalculator.name}
                </span>
              </nav>

              {/* Calculator Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCalculator.name}</h2>
                  <p className="text-muted-foreground mt-1">{selectedCalculator.description}</p>
                </div>
                <button
                  onClick={(e) => toggleFavorite(selectedCalculator.id, e)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
                  title={favorites.includes(selectedCalculator.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    className={cn(
                      "w-5 h-5 transition-colors",
                      favorites.includes(selectedCalculator.id)
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground hover:text-amber-500"
                    )}
                  />
                </button>
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
                      .filter((input) => {
                        // For 24-hour-protein calculator, show/hide inputs based on inputMode
                        if (selectedCalculator.id === "24-hour-protein") {
                          const inputMode = calculatorState.inputMode || "ratio";
                          if (inputMode === "ratio") {
                            // In ratio mode, hide proteinValue and creatinineValue
                            if (input.id === "proteinValue" || input.id === "creatinineValue") return false;
                          } else {
                            // In raw mode, hide ratioValue
                            if (input.id === "ratioValue") return false;
                          }
                        }
                        return true;
                      })
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
                              className={hasUnitToggle(input.id) ? "" : hasUnitConversion(input.id) ? "pr-20" : "pr-16"}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {hasUnitConversion(input.id) && calculatorState[input.id] && (
                                <UnitConversionTooltip
                                  inputId={input.id}
                                  value={calculatorState[input.id] as number}
                                  currentUnit={unitState[input.id] === "si" ? "si" : "conventional"}
                                />
                              )}
                              {!hasUnitToggle(input.id) && input.unit && (
                                <span className="text-xs text-muted-foreground">
                                  {input.unit}
                                </span>
                              )}
                            </div>
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

                        {input.type === "score" && (
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                            <div className="flex-1">
                              {input.description && (
                                <span className="text-xs text-muted-foreground">{input.description}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 p-0 font-semibold text-lg"
                                onClick={() => {
                                  const currentVal = parseInt(String(calculatorState[input.id] ?? 0));
                                  if (currentVal > (input.min ?? 0)) {
                                    handleInputChange(input.id, currentVal - 1);
                                  }
                                }}
                              >
                                −
                              </Button>
                              <span className="w-10 text-center font-semibold text-lg text-primary">
                                {calculatorState[input.id] ?? 0}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 p-0 font-semibold text-lg"
                                onClick={() => {
                                  const currentVal = parseInt(String(calculatorState[input.id] ?? 0));
                                  if (currentVal < (input.max ?? 3)) {
                                    handleInputChange(input.id, currentVal + 1);
                                  }
                                }}
                              >
                                +
                              </Button>
                            </div>
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
              {result !== null && (() => {
                const colorCoding = typeof result === 'number' 
                  ? getResultColorCoding(selectedCalculator.id, result, calculatorState as Record<string, unknown>) 
                  : null;
                
                return (
                <Card className={cn(
                  "border-l-4",
                  colorCoding ? `${colorCoding.bgClass} ${colorCoding.borderClass}` : "border-primary/50 bg-primary/5"
                )}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Result</CardTitle>
                      {colorCoding && (
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          colorCoding.bgClass,
                          colorCoding.textClass
                        )}>
                          {colorCoding.label}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const resultText = `${selectedCalculator.name}\nResult: ${typeof result === "number" ? result.toFixed(2) : "N/A"}${selectedCalculator.resultUnit ? " " + selectedCalculator.resultUnit : ""}\nInterpretation: ${resultInterpretation}`;
                        navigator.clipboard.writeText(resultText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? (
                        <><Check className="w-4 h-4 mr-1" /> Copied!</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-1" /> Copy</>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      {selectedCalculator.id === "corrected-calcium" && typeof result === "object" ? (
                        <>
                          <p className={cn("text-3xl font-bold", colorCoding ? colorCoding.textClass : "text-primary")}>
                            {(result as any).mgDl.toFixed(2)} mg/dL
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {(result as any).mmolL.toFixed(2)} mmol/L
                          </p>
                        </>
                      ) : (
                        <>
                          <p className={cn("text-4xl font-bold", colorCoding ? colorCoding.textClass : "text-primary")}>
                            {typeof result === "number" ? result.toFixed(2) : "N/A"}
                          </p>
                          {selectedCalculator.resultUnit && (
                            <p className="text-sm text-muted-foreground mt-1">{selectedCalculator.resultUnit}</p>
                          )}
                        </>
                      )}
                    </div>

                    {resultInterpretation && (
                      <Alert className={cn(
                        "mt-4",
                        colorCoding && colorCoding.severity === 'danger' && "border-red-500/50 bg-red-500/5",
                        colorCoding && colorCoding.severity === 'warning' && "border-yellow-500/50 bg-yellow-500/5",
                        colorCoding && colorCoding.severity === 'success' && "border-emerald-500/50 bg-emerald-500/5",
                        colorCoding && colorCoding.severity === 'info' && "border-blue-500/50 bg-blue-500/5"
                      )}>
                        <Info className={cn(
                          "h-4 w-4",
                          colorCoding && colorCoding.severity === 'danger' && "text-red-500",
                          colorCoding && colorCoding.severity === 'warning' && "text-yellow-600",
                          colorCoding && colorCoding.severity === 'success' && "text-emerald-500",
                          colorCoding && colorCoding.severity === 'info' && "text-blue-500"
                        )} />
                        <AlertDescription className={cn(
                          colorCoding && colorCoding.severity === 'danger' && "text-red-700 dark:text-red-400",
                          colorCoding && colorCoding.severity === 'warning' && "text-yellow-700 dark:text-yellow-400",
                          colorCoding && colorCoding.severity === 'success' && "text-emerald-700 dark:text-emerald-400",
                          colorCoding && colorCoding.severity === 'info' && "text-blue-700 dark:text-blue-400"
                        )}>{resultInterpretation}</AlertDescription>
                      </Alert>
                    )}

                    {/* Custom KDPI/KDRI Result Display */}
                    {selectedCalculator.id === 'kdpi' && kdpiResult && (
                      <div className="mt-4 space-y-4">
                        {/* KDPI and KDRI Display */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* KDPI Box */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            kdpiResult.kdpi <= 20 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : kdpiResult.kdpi <= 85 
                                ? 'bg-amber-500/10 border-amber-500' 
                                : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">KDPI</p>
                            <p className={`text-3xl font-bold ${
                              kdpiResult.kdpi <= 20 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : kdpiResult.kdpi <= 85 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {kdpiResult.kdpi}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Kidney Donor Profile Index
                            </p>
                          </div>
                          {/* KDRI Box */}
                          <div className="p-4 rounded-lg bg-blue-500/10 border-l-4 border-blue-500">
                            <p className="text-sm font-medium text-muted-foreground">KDRI</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                              {kdpiResult.kdri.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Kidney Donor Risk Index
                            </p>
                          </div>
                        </div>

                        {/* Risk Category */}
                        <div className={`p-4 rounded-lg ${
                          kdpiResult.kdpi <= 20 
                            ? 'bg-emerald-500/10 border border-emerald-500/30' 
                            : kdpiResult.kdpi <= 85 
                              ? 'bg-amber-500/10 border border-amber-500/30' 
                              : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                          <div className="flex items-center gap-2">
                            {kdpiResult.kdpi <= 20 ? (
                              <Check className={`w-5 h-5 text-emerald-600 dark:text-emerald-400`} />
                            ) : kdpiResult.kdpi <= 85 ? (
                              <Info className={`w-5 h-5 text-amber-600 dark:text-amber-400`} />
                            ) : (
                              <AlertTriangle className={`w-5 h-5 text-red-600 dark:text-red-400`} />
                            )}
                            <span className={`font-semibold ${
                              kdpiResult.kdpi <= 20 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : kdpiResult.kdpi <= 85 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {kdpiResult.kdpi <= 20 
                                ? 'Low Risk Donor' 
                                : kdpiResult.kdpi <= 85 
                                  ? 'Standard Criteria Donor' 
                                  : 'High Risk / Expanded Criteria Donor'}
                            </span>
                          </div>
                        </div>

                        {/* Reference Ranges */}
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm font-semibold mb-3">KDPI Reference Ranges</p>
                          <div className="space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded ${
                              kdpiResult.kdpi <= 20 ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Low Risk</span>
                              <span className="text-sm font-medium">0-20%</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${
                              kdpiResult.kdpi > 20 && kdpiResult.kdpi <= 85 ? 'bg-amber-500/20 ring-2 ring-amber-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Standard Criteria</span>
                              <span className="text-sm font-medium">21-85%</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${
                              kdpiResult.kdpi > 85 ? 'bg-red-500/20 ring-2 ring-red-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">High Risk / ECD</span>
                              <span className="text-sm font-medium">&gt;85%</span>
                            </div>
                          </div>
                        </div>

                        {/* Info Note */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-2">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                <strong>Note:</strong> KDPI represents the percentage of donors in a reference population with a KDRI less than or equal to this donor's KDRI. 
                                Higher KDPI indicates higher relative risk of graft failure. Based on OPTN 2024 mapping table.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Banff Result Display */}
                    {selectedCalculator.id === 'banff-classification' && banffResult && (
                      <div className="mt-4 space-y-4">
                        {/* Adequacy Warning/Success */}
                        {!banffResult.isAdequate ? (
                          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="w-5 h-5" />
                              <span className="font-semibold">Specimen adequacy is suboptimal ({banffResult.adequacyStatus}).</span>
                            </div>
                            <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                              Diagnostic accuracy may be limited. Consider repeat biopsy if clinically indicated.
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                              <Check className="w-5 h-5" />
                              <span className="font-semibold">Specimen Adequacy: {banffResult.adequacyStatus}</span>
                            </div>
                            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                              Glomeruli: {calculatorState.glomeruli || 10}, Arteries: {calculatorState.arteries || 2}
                            </p>
                          </div>
                        )}

                        {/* Diagnosis Boxes */}
                        {banffResult.diagnoses.map((diagnosis, idx) => {
                          const diagnosisColors = {
                            tcmr: 'border-l-orange-500 bg-orange-500/5',
                            abmr: 'border-l-red-500 bg-red-500/5',
                            borderline: 'border-l-slate-400 bg-slate-400/5',
                            normal: 'border-l-emerald-500 bg-emerald-500/5'
                          };
                          const colorClass = diagnosisColors[diagnosis.type as keyof typeof diagnosisColors] || diagnosisColors.normal;
                          
                          return (
                            <div key={idx} className={`p-4 rounded-lg border-l-4 ${colorClass}`}>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-foreground">{diagnosis.title}</h3>
                                <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
                                  {diagnosis.category}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{diagnosis.description}</p>
                              
                              {/* Diagnostic Criteria */}
                              {diagnosis.criteria.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm font-semibold mb-2">Diagnostic Criteria:</p>
                                  <div className="space-y-1">
                                    {diagnosis.criteria.map((c, cIdx) => (
                                      <div key={cIdx} className={`flex items-center gap-2 text-sm ${c.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                        <span className="font-bold">{c.met ? '✓' : '✗'}</span>
                                        <span>{c.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Clinical Interpretation */}
                              {diagnosis.interpretation && (
                                <div className="pt-3 border-t border-border/50">
                                  <p className="text-sm font-semibold mb-1">Clinical Interpretation</p>
                                  <p className="text-sm text-muted-foreground">{diagnosis.interpretation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Banff Score Summary */}
                        <div className="p-4 rounded-lg bg-muted/30 border border-border">
                          <h3 className="text-sm font-semibold mb-3">Banff Score Summary</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="text-xs text-muted-foreground">Acute Scores</p>
                              <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.acute}</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="text-xs text-muted-foreground">Chronic Scores</p>
                              <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.chronic}</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="text-xs text-muted-foreground">Chronic Active</p>
                              <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.chronicActive}</p>
                            </div>
                            <div className="p-2 rounded bg-background border border-border/50">
                              <p className="text-xs text-muted-foreground">Other</p>
                              <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.other}</p>
                            </div>
                          </div>
                        </div>

                        {/* Info Note */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Note:</strong> This tool is based on Banff 2022 classification criteria. Clinical context, including graft function, time post-transplant, immunosuppression regimen, and prior rejection episodes should be considered. Molecular diagnostics may provide additional diagnostic information when available.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Mehran CIN Risk Score Display */}
                    {selectedCalculator.id === 'cin-mehran-score' && mehranResult && (
                      <div className="mt-4 space-y-4">
                        {/* Score and Risk Category Display */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Total Score Box */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            mehranResult.totalScore <= 5 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : mehranResult.totalScore <= 10 
                                ? 'bg-yellow-500/10 border-yellow-500' 
                                : mehranResult.totalScore <= 15
                                  ? 'bg-orange-500/10 border-orange-500'
                                  : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">Mehran Score</p>
                            <p className={`text-3xl font-bold ${
                              mehranResult.totalScore <= 5 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : mehranResult.totalScore <= 10 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : mehranResult.totalScore <= 15
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                              {mehranResult.totalScore}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">points</p>
                          </div>
                          {/* Risk Category Box */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            mehranResult.totalScore <= 5 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : mehranResult.totalScore <= 10 
                                ? 'bg-yellow-500/10 border-yellow-500' 
                                : mehranResult.totalScore <= 15
                                  ? 'bg-orange-500/10 border-orange-500'
                                  : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">Risk Category</p>
                            <p className={`text-xl font-bold ${
                              mehranResult.totalScore <= 5 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : mehranResult.totalScore <= 10 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : mehranResult.totalScore <= 15
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                              {mehranResult.riskCategory}
                            </p>
                          </div>
                        </div>

                        {/* CIN and Dialysis Risk Display */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-blue-500/10 border-l-4 border-blue-500">
                            <p className="text-sm font-medium text-muted-foreground">CIN Risk</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {mehranResult.cinRisk}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Contrast-induced nephropathy</p>
                          </div>
                          <div className="p-4 rounded-lg bg-purple-500/10 border-l-4 border-purple-500">
                            <p className="text-sm font-medium text-muted-foreground">Dialysis Risk</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {mehranResult.dialysisRisk}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Requiring dialysis</p>
                          </div>
                        </div>

                        {/* Risk Factor Breakdown */}
                        <div className="p-4 rounded-lg bg-muted/30 border border-border">
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Risk Factor Breakdown
                          </h3>
                          <div className="space-y-2">
                            {mehranResult.breakdown.map((item, idx) => (
                              <div 
                                key={idx} 
                                className={`flex items-center justify-between p-2 rounded ${
                                  item.present 
                                    ? 'bg-primary/10 border border-primary/30' 
                                    : 'bg-muted/50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold text-sm ${
                                    item.present 
                                      ? 'text-primary' 
                                      : 'text-muted-foreground'
                                  }`}>
                                    {item.present ? '✓' : '○'}
                                  </span>
                                  <span className={`text-sm ${
                                    item.present 
                                      ? 'text-foreground' 
                                      : 'text-muted-foreground'
                                  }`}>
                                    {item.factor}
                                  </span>
                                </div>
                                <span className={`text-sm font-medium ${
                                  item.present && item.points > 0
                                    ? 'text-primary' 
                                    : 'text-muted-foreground'
                                }`}>
                                  +{item.points} pts
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Reference Ranges */}
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm font-semibold mb-3">Risk Stratification</p>
                          <div className="space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded ${
                              mehranResult.totalScore <= 5 ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Low Risk</span>
                              <span className="text-sm font-medium">≤5 pts (CIN 7.5%, Dialysis 0.04%)</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${
                              mehranResult.totalScore > 5 && mehranResult.totalScore <= 10 ? 'bg-yellow-500/20 ring-2 ring-yellow-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Moderate Risk</span>
                              <span className="text-sm font-medium">6-10 pts (CIN 14%, Dialysis 0.12%)</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${
                              mehranResult.totalScore > 10 && mehranResult.totalScore <= 15 ? 'bg-orange-500/20 ring-2 ring-orange-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">High Risk</span>
                              <span className="text-sm font-medium">11-15 pts (CIN 26.1%, Dialysis 1.09%)</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${
                              mehranResult.totalScore > 15 ? 'bg-red-500/20 ring-2 ring-red-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Very High Risk</span>
                              <span className="text-sm font-medium">&gt;15 pts (CIN 57.3%, Dialysis 12.6%)</span>
                            </div>
                          </div>
                        </div>

                        {/* Clinical Recommendations */}
                        <div className={`p-4 rounded-lg border ${
                          mehranResult.totalScore <= 5 
                            ? 'bg-emerald-500/5 border-emerald-500/30' 
                            : mehranResult.totalScore <= 10 
                              ? 'bg-yellow-500/5 border-yellow-500/30' 
                              : mehranResult.totalScore <= 15
                                ? 'bg-orange-500/5 border-orange-500/30'
                                : 'bg-red-500/5 border-red-500/30'
                        }`}>
                          <div className="flex items-start gap-2">
                            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold mb-2">Clinical Recommendations</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {mehranResult.totalScore <= 5 && (
                                  <>
                                    <li>• Standard hydration protocol</li>
                                    <li>• Minimize contrast volume when possible</li>
                                    <li>• Monitor creatinine at 48-72 hours post-procedure</li>
                                  </>
                                )}
                                {mehranResult.totalScore > 5 && mehranResult.totalScore <= 10 && (
                                  <>
                                    <li>• Aggressive IV hydration (1 mL/kg/hr for 12 hrs pre/post)</li>
                                    <li>• Use iso-osmolar or low-osmolar contrast</li>
                                    <li>• Minimize contrast volume (&lt;3 × eGFR mL)</li>
                                    <li>• Monitor creatinine at 24, 48, and 72 hours</li>
                                  </>
                                )}
                                {mehranResult.totalScore > 10 && mehranResult.totalScore <= 15 && (
                                  <>
                                    <li>• Consider alternative imaging if possible</li>
                                    <li>• Aggressive IV hydration with sodium bicarbonate</li>
                                    <li>• Strict contrast volume limitation</li>
                                    <li>• Hold nephrotoxic medications</li>
                                    <li>• Close monitoring with daily creatinine</li>
                                  </>
                                )}
                                {mehranResult.totalScore > 15 && (
                                  <>
                                    <li>• Strongly consider alternative imaging modalities</li>
                                    <li>• If contrast required: minimal volume, staged procedures</li>
                                    <li>• Prophylactic RRT may be considered in select cases</li>
                                    <li>• Nephrology consultation recommended</li>
                                    <li>• ICU monitoring may be warranted</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Info Note */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Reference:</strong> Mehran R, et al. A simple risk score for prediction of contrast-induced nephropathy after percutaneous coronary intervention. J Am Coll Cardiol. 2004;44(7):1393-1399.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom FRAX Fracture Risk Display */}
                    {selectedCalculator.id === 'frax-simplified' && fraxResult && (
                      <div className="mt-4 space-y-4">
                        {/* Major Fracture and Hip Fracture Risk Display */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Major Osteoporotic Fracture */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            fraxResult.majorFracture < 10 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : fraxResult.majorFracture < 20 
                                ? 'bg-yellow-500/10 border-yellow-500' 
                                : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">Major Osteoporotic Fracture</p>
                            <p className={`text-3xl font-bold ${
                              fraxResult.majorFracture < 10 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : fraxResult.majorFracture < 20 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {fraxResult.majorFracture.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">10-year probability</p>
                          </div>
                          {/* Hip Fracture */}
                          <div className={`p-4 rounded-lg border-l-4 ${
                            fraxResult.hipFracture < 3 
                              ? 'bg-emerald-500/10 border-emerald-500' 
                              : fraxResult.hipFracture < 6 
                                ? 'bg-yellow-500/10 border-yellow-500' 
                                : 'bg-red-500/10 border-red-500'
                          }`}>
                            <p className="text-sm font-medium text-muted-foreground">Hip Fracture</p>
                            <p className={`text-3xl font-bold ${
                              fraxResult.hipFracture < 3 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : fraxResult.hipFracture < 6 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {fraxResult.hipFracture.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">10-year probability</p>
                          </div>
                        </div>

                        {/* Risk Category */}
                        <div className={`p-4 rounded-lg ${
                          fraxResult.majorFracture < 10 
                            ? 'bg-emerald-500/10 border border-emerald-500/30' 
                            : fraxResult.majorFracture < 20 
                              ? 'bg-yellow-500/10 border border-yellow-500/30' 
                              : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                          <div className="flex items-center gap-2">
                            {fraxResult.majorFracture < 10 ? (
                              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : fraxResult.majorFracture < 20 ? (
                              <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                            <span className={`font-semibold ${
                              fraxResult.majorFracture < 10 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : fraxResult.majorFracture < 20 
                                  ? 'text-yellow-600 dark:text-yellow-400' 
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {fraxResult.majorFracture < 10 
                                ? 'Low Fracture Risk' 
                                : fraxResult.majorFracture < 20 
                                  ? 'Moderate Fracture Risk - Consider Treatment' 
                                  : 'High Fracture Risk - Treatment Recommended'}
                            </span>
                          </div>
                        </div>

                        {/* Treatment Thresholds */}
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm font-semibold mb-3">Treatment Thresholds (NOF/ISCD Guidelines)</p>
                          <div className="space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded ${
                              fraxResult.majorFracture < 20 && fraxResult.hipFracture < 3 ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Below Treatment Threshold</span>
                              <span className="text-sm font-medium">MOF &lt;20% AND Hip &lt;3%</span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded ${
                              fraxResult.majorFracture >= 20 || fraxResult.hipFracture >= 3 ? 'bg-red-500/20 ring-2 ring-red-500' : 'bg-muted'
                            }`}>
                              <span className="text-sm">Above Treatment Threshold</span>
                              <span className="text-sm font-medium">MOF ≥20% OR Hip ≥3%</span>
                            </div>
                          </div>
                        </div>

                        {/* Clinical Recommendations */}
                        <div className={`p-4 rounded-lg border ${
                          fraxResult.majorFracture < 10 
                            ? 'bg-emerald-500/5 border-emerald-500/30' 
                            : fraxResult.majorFracture < 20 
                              ? 'bg-yellow-500/5 border-yellow-500/30' 
                              : 'bg-red-500/5 border-red-500/30'
                        }`}>
                          <div className="flex items-start gap-2">
                            <Bone className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold mb-2">Clinical Recommendations</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {fraxResult.majorFracture < 10 && fraxResult.hipFracture < 3 && (
                                  <>
                                    <li>• Lifestyle modifications (weight-bearing exercise, fall prevention)</li>
                                    <li>• Adequate calcium (1000-1200 mg/day) and vitamin D (800-1000 IU/day)</li>
                                    <li>• Reassess fracture risk in 5 years or if risk factors change</li>
                                  </>
                                )}
                                {(fraxResult.majorFracture >= 10 || fraxResult.hipFracture >= 3) && fraxResult.majorFracture < 20 && (
                                  <>
                                    <li>• Consider DXA scan if not already performed</li>
                                    <li>• Discuss pharmacologic treatment options</li>
                                    <li>• Address modifiable risk factors</li>
                                    <li>• Fall risk assessment and prevention</li>
                                  </>
                                )}
                                {(fraxResult.majorFracture >= 20 || fraxResult.hipFracture >= 3) && (
                                  <>
                                    <li>• Pharmacologic treatment recommended</li>
                                    <li>• First-line: Bisphosphonates (alendronate, risedronate, zoledronic acid)</li>
                                    <li>• Alternatives: Denosumab, teriparatide, romosozumab</li>
                                    <li>• Comprehensive fall prevention program</li>
                                    <li>• Monitor treatment response with DXA</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* CKD-Specific Considerations */}
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">CKD-MBD Considerations</p>
                              <ul className="text-sm text-amber-600/80 dark:text-amber-400/80 space-y-1">
                                <li>• FRAX may underestimate fracture risk in CKD patients</li>
                                <li>• Bisphosphonates: Use with caution if eGFR &lt;30-35 mL/min</li>
                                <li>• Consider PTH, calcium, phosphorus, and vitamin D status</li>
                                <li>• Adynamic bone disease may increase fracture risk</li>
                                <li>• Consult nephrology for CKD stages 4-5</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Info Note */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <strong>Note:</strong> This is a simplified FRAX calculation. For official FRAX scores, use the FRAX tool at <a href="https://www.sheffield.ac.uk/FRAX/" target="_blank" rel="noopener noreferrer" className="underline">www.sheffield.ac.uk/FRAX</a>. Treatment decisions should incorporate clinical judgment and patient preferences.
                            </p>
                          </div>
                        </div>
                      </div>
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
              );
              })()}

              {/* Standalone Banff Result Display - shown when result is null but banffResult exists */}
              {selectedCalculator.id === 'banff-classification' && banffResult && result === null && (
                <Card className="border-l-4 border-emerald-500 bg-emerald-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      Banff Classification Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Adequacy Warning/Success */}
                      {!banffResult.isAdequate ? (
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">Specimen adequacy is suboptimal ({banffResult.adequacyStatus}).</span>
                          </div>
                          <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                            Diagnostic accuracy may be limited. Consider repeat biopsy if clinically indicated.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-5 h-5" />
                            <span className="font-semibold">Specimen Adequacy: {banffResult.adequacyStatus}</span>
                          </div>
                          <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                            Glomeruli: {calculatorState.glomeruli || 10}, Arteries: {calculatorState.arteries || 2}
                          </p>
                        </div>
                      )}

                      {/* Diagnosis Boxes */}
                      {banffResult.diagnoses.map((diagnosis, idx) => {
                        const diagnosisColors = {
                          tcmr: 'border-l-orange-500 bg-orange-500/5',
                          abmr: 'border-l-red-500 bg-red-500/5',
                          borderline: 'border-l-slate-400 bg-slate-400/5',
                          normal: 'border-l-emerald-500 bg-emerald-500/5'
                        };
                        const colorClass = diagnosisColors[diagnosis.type as keyof typeof diagnosisColors] || diagnosisColors.normal;
                        
                        return (
                          <div key={idx} className={`p-4 rounded-lg border-l-4 ${colorClass}`}>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-bold text-foreground">{diagnosis.title}</h3>
                              <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
                                {diagnosis.category}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{diagnosis.description}</p>
                            
                            {/* Diagnostic Criteria */}
                            {diagnosis.criteria.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-semibold mb-2">Diagnostic Criteria:</p>
                                <div className="space-y-1">
                                  {diagnosis.criteria.map((c, cIdx) => (
                                    <div key={cIdx} className={`flex items-center gap-2 text-sm ${c.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                      <span className="font-bold">{c.met ? '✓' : '✗'}</span>
                                      <span>{c.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Clinical Interpretation */}
                            {diagnosis.interpretation && (
                              <div className="pt-3 border-t border-border/50">
                                <p className="text-sm font-semibold mb-1">Clinical Interpretation</p>
                                <p className="text-sm text-muted-foreground">{diagnosis.interpretation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Banff Score Summary */}
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h3 className="text-sm font-semibold mb-3">Banff Score Summary</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-background border border-border/50">
                            <p className="text-xs text-muted-foreground">Acute Scores</p>
                            <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.acute}</p>
                          </div>
                          <div className="p-2 rounded bg-background border border-border/50">
                            <p className="text-xs text-muted-foreground">Chronic Scores</p>
                            <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.chronic}</p>
                          </div>
                          <div className="p-2 rounded bg-background border border-border/50">
                            <p className="text-xs text-muted-foreground">Chronic Active</p>
                            <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.chronicActive}</p>
                          </div>
                          <div className="p-2 rounded bg-background border border-border/50">
                            <p className="text-xs text-muted-foreground">Other</p>
                            <p className="text-sm font-mono font-medium">{banffResult.scoreSummary.other}</p>
                          </div>
                        </div>
                      </div>

                      {/* Info Note */}
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            <strong>Note:</strong> This tool is based on Banff 2022 classification criteria. Clinical context, including graft function, time post-transplant, immunosuppression regimen, and prior rejection episodes should be considered.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Clinical Decision Support Recommendations */}
              {result !== null && (() => {
                const recKey = getRecommendationKey(selectedCalculator.id, typeof result === 'number' ? result : 0);
                const rec = recKey ? getRecommendations(selectedCalculator.id, recKey) : null;
                
                if (!rec) return null;
                
                const urgencyColorMap = {
                  routine: "border-blue-500/50 bg-blue-500/5",
                  urgent: "border-orange-500/50 bg-orange-500/5",
                  emergent: "border-red-500/50 bg-red-500/5"
                };
                
                const getUrgencyIcon = (urgency: string) => {
                  switch(urgency) {
                    case 'urgent':
                      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
                    case 'emergent':
                      return <AlertTriangle className="w-4 h-4 text-red-500" />;
                    default:
                      return <Info className="w-4 h-4 text-blue-500" />;
                  }
                };
                
                return (
                  <Card className={`border ${urgencyColorMap[rec.urgency || 'routine']}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getUrgencyIcon(rec.urgency || 'routine')}
                        Clinical Decision Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-semibold text-sm mb-1">{rec.condition}</p>
                        <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                      </div>
                      
                      {rec.actionItems.length > 0 && (
                        <div>
                          <p className="font-semibold text-sm mb-2">Recommended Actions:</p>
                          <ul className="space-y-1">
                            {rec.actionItems.map((item, idx) => (
                              <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                                <span className="text-primary flex-shrink-0">→</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

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
