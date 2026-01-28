/**
 * ASNRT Nephrology Calculator Dashboard
 * Professional open-access calculator for nephrologists
 * 52 calculators organized by clinical category
 */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calculator, Stethoscope } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculators, getCategories, getCalculatorById } from "@/lib/calculatorData";
import * as calc from "@/lib/calculators";

interface CalculatorState {
  [key: string]: string | number | boolean;
}

export default function Dashboard() {
  const [selectedCalculatorId, setSelectedCalculatorId] = useState<string | null>(null);
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({});
  const [result, setResult] = useState<number | null>(null);
  const [resultInterpretation, setResultInterpretation] = useState<string>("");

  const categories = useMemo(() => getCategories(), []);
  const selectedCalculator = useMemo(
    () => (selectedCalculatorId ? getCalculatorById(selectedCalculatorId) : null),
    [selectedCalculatorId]
  );

  const handleInputChange = (inputId: string, value: string | number | boolean) => {
    setCalculatorState((prev) => ({
      ...prev,
      [inputId]: value,
    }));
  };

  const handleCalculate = () => {
    if (!selectedCalculator) return;

    try {
      let calculationResult: number | { [key: string]: number } | undefined;

      // Call appropriate calculator function based on ID
      switch (selectedCalculator.id) {
        case "ckd-epi-creatinine":
          calculationResult = calc.ckdEpiCreatinine(
            calculatorState.creatinine as number,
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            calculatorState.race as "Black" | "Other",
            calculatorState.creatinineUnit as "mg/dL" | "μmol/L"
          );
          break;

        case "cockcroft-gault":
          calculationResult = calc.cockcrofGault(
            calculatorState.creatinine as number,
            calculatorState.age as number,
            calculatorState.weight as number,
            calculatorState.sex as "M" | "F",
            calculatorState.creatinineUnit as "mg/dL" | "μmol/L"
          );
          break;

        case "schwartz-pediatric":
          calculationResult = calc.schwartzPediatric(
            calculatorState.creatinine as number,
            calculatorState.height as number,
            calculatorState.creatinineUnit as "mg/dL" | "μmol/L"
          );
          break;

        case "kinetic-egfr":
          calculationResult = calc.kineticEgfr(
            calculatorState.preBUN as number,
            calculatorState.postBUN as number,
            calculatorState.preCreatinine as number,
            calculatorState.postCreatinine as number,
            calculatorState.weight as number,
            calculatorState.sessionTime as number,
            calculatorState.creatinineUnit as "mg/dL" | "μmol/L"
          );
          break;

        case "ckd-epi-cystatin-c":
          calculationResult = calc.ckdEpiCystatinC(
            calculatorState.creatinine as number,
            calculatorState.cystatinC as number,
            calculatorState.age as number,
            calculatorState.sex as "M" | "F",
            calculatorState.creatinineUnit as "mg/dL" | "μmol/L"
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
            calculatorState.plasmaCr as number,
            calculatorState.plasmaNa as number,
            calculatorState.urineCr as number,
            calculatorState.creatinineUnit as "mg/dL" | "μmol/L"
          );
          break;

        case "feurea":
          calculationResult = calc.feurea(
            calculatorState.urineUrea as number,
            calculatorState.plasmaCr as number,
            calculatorState.plasmaUrea as number,
            calculatorState.urineCr as number,
            calculatorState.creatinineUnit as "mg/dL" | "μmol/L"
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
            calculatorState.glucose as number,
            calculatorState.bun as number,
            calculatorState.ethanol as number,
            calculatorState.glucoseUnit as "mg/dL" | "mmol/L",
            calculatorState.bunUnit as "mg/dL" | "mmol/L"
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
            calculatorState.glucose as number,
            calculatorState.glucoseUnit as "mg/dL" | "mmol/L"
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
            calculatorState.measuredCa as number,
            calculatorState.albumin as number,
            calculatorState.albuminUnit as "g/dL" | "g/L"
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
            calculatorState.preBUN as number,
            calculatorState.postBUN as number,
            calculatorState.weight as number,
            calculatorState.sessionTime as number,
            calculatorState.bunUnit as "mg/dL" | "mmol/L"
          );
          break;

        case "total-body-water":
          calculationResult = calc.totalBodyWaterWatson(
            calculatorState.weight as number,
            calculatorState.age as number,
            calculatorState.sex as "M" | "F"
          );
          break;

        case "hd-session-duration":
          calculationResult = calc.hemodialysisSessionDuration(
            calculatorState.targetKtV as number,
            calculatorState.preBUN as number,
            calculatorState.postBUN as number,
            calculatorState.weight as number,
            calculatorState.bunUnit as "mg/dL" | "mmol/L"
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
            calculatorState.preBUN as number,
            calculatorState.postBUN as number,
            calculatorState.bunUnit as "mg/dL" | "mmol/L"
          );
          break;

        case "iron-deficit":
          calculationResult = calc.ironDeficitGanzoni(
            calculatorState.targetHemoglobin as number,
            calculatorState.currentHemoglobin as number,
            calculatorState.weight as number,
            calculatorState.sex as "M" | "F"
          );
          break;

        case "kdpi":
          calculationResult = calc.kdpi(
            calculatorState.donorAge as number,
            calculatorState.donorHeight as number,
            calculatorState.donorWeight as number,
            calculatorState.donorCreatinine as number,
            calculatorState.donorHypertension as boolean,
            calculatorState.donorDiabetes as boolean,
            calculatorState.donorAfricanAmerican as boolean,
            calculatorState.donorHepCPositive as boolean,
            calculatorState.causeOfDeathStroke as boolean,
            calculatorState.donorAfterCirculatoryDeath as boolean,
            calculatorState.creatinineUnit as "mg/dL" | "μmol/L"
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
            calculatorState.totalCholesterol as number,
            calculatorState.hdl as number,
            calculatorState.systolicBP as number,
            calculatorState.treated as boolean,
            calculatorState.diabetes as boolean,
            calculatorState.smoker as boolean,
            calculatorState.race as "Black" | "White"
          );
          break;

        case "bmi":
          calculationResult = calc.bmi(
            calculatorState.weight as number,
            calculatorState.height as number,
            calculatorState.heightUnit as "cm" | "in"
          );
          break;

        case "bsa-dubois":
          calculationResult = calc.bsaDuBois(
            calculatorState.weight as number,
            calculatorState.height as number,
            calculatorState.heightUnit as "cm" | "in"
          );
          break;

        case "bsa-mosteller":
          calculationResult = calc.bsaMosteller(
            calculatorState.weight as number,
            calculatorState.height as number,
            calculatorState.heightUnit as "cm" | "in"
          );
          break;

        case "devine-ibw":
          calculationResult = calc.devineIdealBodyWeight(
            calculatorState.height as number,
            calculatorState.sex as "M" | "F",
            calculatorState.heightUnit as "cm" | "in"
          );
          break;

        case "lean-body-weight":
          calculationResult = calc.leanBodyWeight(
            calculatorState.weight as number,
            calculatorState.height as number,
            calculatorState.sex as "M" | "F",
            calculatorState.heightUnit as "cm" | "in"
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
            calculatorState.calcium as number,
            calculatorState.phosphate as number,
            calculatorState.calciumUnit as "mg/dL" | "mmol/L",
            calculatorState.phosphateUnit as "mg/dL" | "mmol/L"
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
            calculatorState.urineaNitrogen as number,
            calculatorState.respiratoryRate as number,
            calculatorState.bloodPressureSystolic as number,
            calculatorState.bloodPressureDiastolic as number,
            calculatorState.age as number,
            calculatorState.bunUnit as "mg/dL" | "mmol/L"
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
  };

  const handleSelectCalculator = (calcId: string) => {
    setSelectedCalculatorId(calcId);
    setCalculatorState({});
    setResult(null);
    setResultInterpretation("");
  };

  const allRequiredFilled = selectedCalculator
    ? selectedCalculator.inputs
        .filter((input) => input.required)
        .every((input) => calculatorState[input.id] !== undefined && calculatorState[input.id] !== "")
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">ASNRT Nephrology Calculator</h1>
              <p className="text-sm text-slate-400">Professional clinical calculator dashboard</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Calculator List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Calculators</CardTitle>
                <CardDescription className="text-slate-400">52 clinical tools</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={categories[0]} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 gap-1 bg-slate-700 p-1 h-auto">
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="text-xs py-2 data-[state=active]:bg-blue-600 text-slate-300 data-[state=active]:text-white"
                      >
                        {category.split(" & ")[0]}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {categories.map((category) => (
                    <TabsContent key={category} value={category} className="mt-3 space-y-2">
                      {calculators
                        .filter((c) => c.category === category)
                        .map((calc) => (
                          <Button
                            key={calc.id}
                            variant={selectedCalculatorId === calc.id ? "default" : "outline"}
                            className={`w-full justify-start text-left h-auto py-2 px-3 text-xs ${
                              selectedCalculatorId === calc.id
                                ? "bg-blue-600 border-blue-600"
                                : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                            }`}
                            onClick={() => handleSelectCalculator(calc.id)}
                          >
                            <span className="truncate">{calc.name}</span>
                          </Button>
                        ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Calculator */}
          <div className="lg:col-span-3">
            {selectedCalculator ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white">{selectedCalculator.name}</CardTitle>
                      <CardDescription className="text-slate-400 mt-2">
                        {selectedCalculator.description}
                      </CardDescription>
                    </div>
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Calculator className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Input Fields */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white">Input Values</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCalculator.inputs.map((input) => (
                        <div key={input.id} className="space-y-2">
                          <Label className="text-slate-300 text-sm">
                            {input.label}
                            {input.unit && <span className="text-slate-500 ml-1">({input.unit})</span>}
                            {input.required && <span className="text-red-400 ml-1">*</span>}
                          </Label>

                          {input.type === "number" && (
                            <Input
                              type="number"
                              placeholder={input.placeholder}
                              value={String(calculatorState[input.id] ?? "")}
                              onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value) || "")}
                              min={input.min}
                              max={input.max}
                              step={input.step}
                              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                            />
                          )}

                          {input.type === "select" && (
                            <Select
                              value={String(calculatorState[input.id] ?? "")}
                              onValueChange={(value) => handleInputChange(input.id, value)}
                            >
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                {input.options?.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value} className="text-white">
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {input.type === "checkbox" && (
                            <div className="flex items-center space-x-2 mt-2">
                              <Checkbox
                                id={input.id}
                                checked={Boolean(calculatorState[input.id])}
                                onCheckedChange={(checked) => handleInputChange(input.id, checked === true)}
                                className="border-slate-500"
                              />
                              <Label htmlFor={input.id} className="text-slate-300 cursor-pointer">
                                Yes
                              </Label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <Button
                    onClick={handleCalculate}
                    disabled={!allRequiredFilled}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 h-auto"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate
                  </Button>

                  {/* Result */}
                  {result !== null && (
                    <div className="space-y-3 pt-4 border-t border-slate-700">
                      <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4">
                        <p className="text-slate-400 text-sm mb-1">Result</p>
                        <p className="text-3xl font-bold text-blue-400">
                          {typeof result === "number" ? result.toFixed(2) : result}
                          {selectedCalculator.resultUnit && (
                            <span className="text-lg text-slate-400 ml-2">{selectedCalculator.resultUnit}</span>
                          )}
                        </p>
                      </div>

                      {resultInterpretation && (
                        <Alert className="bg-slate-700 border-slate-600">
                          <AlertCircle className="h-4 w-4 text-blue-400" />
                          <AlertDescription className="text-slate-300 ml-2">
                            {resultInterpretation}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Clinical Pearls */}
                  {selectedCalculator.clinicalPearls.length > 0 && (
                    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-white">Clinical Pearls</h4>
                      <ul className="space-y-1">
                        {selectedCalculator.clinicalPearls.map((pearl, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex gap-2">
                            <span className="text-blue-400 flex-shrink-0">•</span>
                            <span>{pearl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* References */}
                  {selectedCalculator.references.length > 0 && (
                    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-white">References</h4>
                      <ul className="space-y-1">
                        {selectedCalculator.references.map((ref, idx) => (
                          <li key={idx} className="text-xs text-slate-400">
                            {ref}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Calculator className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Select a calculator from the left panel to begin</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
