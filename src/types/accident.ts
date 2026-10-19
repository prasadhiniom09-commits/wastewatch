/**
 * Type definitions for CIVIC PULSE
 * MoRTH Road Accident Dataset (RA2019_A2) Analysis
 */

export interface RawCsvRow {
  state: string;
  accidents2016: number;
  accidents2017: number;
  accidents2018: number;
  accidents2019: number;
  rank2019: number | null;
  share2016: number;
  share2017: number;
  share2018: number;
  share2019: number;
  ratePerLakhPop2016: number | null;
  ratePerLakhPop2017: number | null;
  ratePerLakhPop2018: number | null;
  ratePerLakhPop2019: number | null;
  ratePer10kVehicles2016: number | null;
  ratePer10kVehicles2017: number | null;
  ratePer10kVehicles2018: number | null;
  ratePer10kVehicles2019: number | null;
  densityPer10kKmRoads2016: number | null;
  densityPer10kKmRoads2017: number | null;
  densityPer10kKmRoads2018P: number | null;
}

export interface LinearTrendResult {
  slope: number; // m in y = mx + c (annual rate of change)
  intercept: number; // c in y = mx + c
  rSquared: number; // goodness of fit R²
  projected2020: number; // linear trend projection for 2020
  direction: 'increasing' | 'decreasing' | 'stable';
  annualAverageDelta: number;
}

export type PriorityTier = 'LOW PRIORITY' | 'MEDIUM PRIORITY' | 'HIGH PRIORITY';

export interface PriorityBreakdown {
  score: number; // 0 to 100
  tier: PriorityTier;
  components: {
    popRateNorm: number | null; // 0-1
    vehicleRateNorm: number | null; // 0-1
    roadDensityNorm: number | null; // 0-1
    trendMomentumNorm: number; // 0-1
  };
  weights: {
    popRate: number;
    vehicleRate: number;
    roadDensity: number;
    trendMomentum: number;
  };
  reasons: string[];
}

export interface CivilEngineeringRecommendation {
  id: string;
  title: string;
  category:
    | 'Road Safety Audit'
    | 'Black-Spot Identification'
    | 'Junction Improvement'
    | 'Traffic Management'
    | 'Pedestrian Safety'
    | 'Geometry & Signage'
    | 'Speed Management'
    | 'Intelligent Transportation Systems'
    | 'Site-Level Investigation';
  description: string;
  dataJustification: string;
  urgency: 'High' | 'Medium' | 'Routine';
  standardsReference: string; // e.g. IRC:SP:88, IRC:67, MoRTH Guidelines
}

export interface StateRecord extends RawCsvRow {
  isUT: boolean;
  isTotal: boolean;
  change2016to2019Pct: number;
  change2018to2019Pct: number;
  trend: LinearTrendResult;
  priority: PriorityBreakdown;
  recommendations: CivilEngineeringRecommendation[];
  engineeringInterpretation: string;
}

export type IndicatorKey =
  | 'accidents2019'
  | 'ratePerLakhPop2019'
  | 'ratePer10kVehicles2019'
  | 'densityPer10kKmRoads2018P'
  | 'change2016to2019Pct';

export interface IndicatorMeta {
  key: IndicatorKey;
  label: string;
  shortLabel: string;
  unit: string;
  description: string;
  higherIsBetter: boolean;
  nationalValue2019: number | null;
}
