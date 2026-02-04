import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowLeftRight, Info } from "lucide-react";
import { ckdEpiCreatinine, cockcrofGault, mdrdGfr, lundMalmoRevised, bis1Elderly, fasFullAgeSpectrum } from "@/lib/calculators";

interface EGFRComparisonProps {
  onClose?: () => void;
}

export function EGFRComparison({ onClose }: EGFRComparisonProps) {
  // Patient data state
  const [age, setAge] = useState<string>("55");
  const [sex, setSex] = useState<"M" | "F">("M");
  const [race, setRace] = useState<"Black" | "Other">("Other");
  const [creatinine, setCreatinine] = useState<string>("1.2");
  const [creatinineUnit, setCreatinineUnit] = useState<"mg/dL" | "μmol/L">("mg/dL");
  const [weight, setWeight] = useState<string>("70");
  const [calculated, setCalculated] = useState(false);

  // Calculate all eGFR values
  const results = useMemo(() => {
    if (!calculated) return null;
    
    const ageNum = parseFloat(age);
    const creatNum = parseFloat(creatinine);
    const weightNum = parseFloat(weight);
    
    if (isNaN(ageNum) || isNaN(creatNum) || ageNum <= 0 || creatNum <= 0) {
      return null;
    }

    const ckdEpi = ckdEpiCreatinine(creatNum, ageNum, sex, race, creatinineUnit);
    const mdrd = mdrdGfr(creatNum, ageNum, sex, race, creatinineUnit);
    const cockcroftGault = !isNaN(weightNum) && weightNum > 0 
      ? cockcrofGault(creatNum, ageNum, weightNum, sex, creatinineUnit)
      : null;

    return {
      ckdEpi,
      mdrd,
      cockcroftGault,
    };
  }, [calculated, age, creatinine, creatinineUnit, sex, race, weight]);

  const handleCalculate = () => {
    setCalculated(true);
  };

  const handleReset = () => {
    setCalculated(false);
  };

  const getCKDStage = (egfr: number): { stage: string; color: string; description: string } => {
    if (egfr >= 90) return { stage: "G1", color: "bg-green-500", description: "Normal or high" };
    if (egfr >= 60) return { stage: "G2", color: "bg-yellow-500", description: "Mildly decreased" };
    if (egfr >= 45) return { stage: "G3a", color: "bg-orange-400", description: "Mildly to moderately decreased" };
    if (egfr >= 30) return { stage: "G3b", color: "bg-orange-500", description: "Moderately to severely decreased" };
    if (egfr >= 15) return { stage: "G4", color: "bg-red-400", description: "Severely decreased" };
    return { stage: "G5", color: "bg-red-600", description: "Kidney failure" };
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">eGFR Equation Comparison</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Compare eGFR results from CKD-EPI (2021), MDRD, and Cockcroft-Gault equations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="comp-age">Age (years)</Label>
            <Input
              id="comp-age"
              type="number"
              value={age}
              onChange={(e) => { setAge(e.target.value); setCalculated(false); }}
              placeholder="55"
            />
          </div>

          {/* Creatinine with unit toggle */}
          <div className="space-y-2">
            <Label htmlFor="comp-creatinine">Serum Creatinine</Label>
            <div className="flex gap-1">
              <Input
                id="comp-creatinine"
                type="number"
                step="0.1"
                value={creatinine}
                onChange={(e) => { setCreatinine(e.target.value); setCalculated(false); }}
                placeholder={creatinineUnit === "mg/dL" ? "1.2" : "106"}
                className="flex-1"
              />
              <div className="flex rounded-md border overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setCreatinineUnit("mg/dL"); setCalculated(false); }}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    creatinineUnit === "mg/dL"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  mg/dL
                </button>
                <button
                  type="button"
                  onClick={() => { setCreatinineUnit("μmol/L"); setCalculated(false); }}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    creatinineUnit === "μmol/L"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  μmol/L
                </button>
              </div>
            </div>
          </div>

          {/* Weight (for Cockcroft-Gault) */}
          <div className="space-y-2">
            <Label htmlFor="comp-weight">Weight (kg)</Label>
            <Input
              id="comp-weight"
              type="number"
              value={weight}
              onChange={(e) => { setWeight(e.target.value); setCalculated(false); }}
              placeholder="70"
            />
            <p className="text-xs text-muted-foreground">For Cockcroft-Gault</p>
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <Label>Sex</Label>
            <Select value={sex} onValueChange={(v) => { setSex(v as "M" | "F"); setCalculated(false); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Race (for MDRD) */}
          <div className="space-y-2">
            <Label>Race</Label>
            <Select value={race} onValueChange={(v) => { setRace(v as "Black" | "Other"); setCalculated(false); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Other">Non-Black</SelectItem>
                <SelectItem value="Black">Black</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">For MDRD only</p>
          </div>
        </div>

        {/* Calculate Button */}
        <div className="flex gap-2">
          <Button onClick={handleCalculate} className="flex-1">
            <Calculator className="h-4 w-4 mr-2" />
            Compare Equations
          </Button>
          {calculated && (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4" />
              Comparison Results
            </div>
            
            <div className="grid gap-3">
              {/* CKD-EPI 2021 */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div>
                  <div className="font-medium">CKD-EPI 2021</div>
                  <div className="text-xs text-muted-foreground">Race-free equation (recommended)</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{results.ckdEpi}</div>
                  <div className="text-xs text-muted-foreground">mL/min/1.73m²</div>
                  <Badge className={`mt-1 ${getCKDStage(results.ckdEpi).color}`}>
                    {getCKDStage(results.ckdEpi).stage}: {getCKDStage(results.ckdEpi).description}
                  </Badge>
                </div>
              </div>

              {/* MDRD */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div>
                  <div className="font-medium">MDRD-4</div>
                  <div className="text-xs text-muted-foreground">Includes race factor</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{results.mdrd}</div>
                  <div className="text-xs text-muted-foreground">mL/min/1.73m²</div>
                  <Badge className={`mt-1 ${getCKDStage(results.mdrd).color}`}>
                    {getCKDStage(results.mdrd).stage}: {getCKDStage(results.mdrd).description}
                  </Badge>
                </div>
              </div>

              {/* Cockcroft-Gault */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div>
                  <div className="font-medium">Cockcroft-Gault</div>
                  <div className="text-xs text-muted-foreground">Creatinine clearance (not BSA-adjusted)</div>
                </div>
                <div className="text-right">
                  {results.cockcroftGault !== null ? (
                    <>
                      <div className="text-2xl font-bold">{results.cockcroftGault}</div>
                      <div className="text-xs text-muted-foreground">mL/min</div>
                      <Badge className={`mt-1 ${getCKDStage(results.cockcroftGault).color}`}>
                        {getCKDStage(results.cockcroftGault).stage}: {getCKDStage(results.cockcroftGault).description}
                      </Badge>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Enter weight</div>
                  )}
                </div>
              </div>
            </div>

            {/* Difference Analysis */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Key Differences
              </div>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>CKD-EPI 2021</strong>: Most accurate, race-free, recommended by KDIGO</li>
                <li>• <strong>MDRD</strong>: Less accurate at eGFR &gt;60, includes race coefficient</li>
                <li>• <strong>Cockcroft-Gault</strong>: Estimates CrCl (not eGFR), used for drug dosing</li>
                {results.ckdEpi !== results.mdrd && (
                  <li className="mt-2 font-medium">
                    Difference between CKD-EPI and MDRD: {Math.abs(results.ckdEpi - results.mdrd)} mL/min/1.73m²
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EGFRComparison;
