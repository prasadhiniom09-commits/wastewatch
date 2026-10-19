import { RAW_CSV_DATA } from '../data/rawCsv';
import {
  RawCsvRow,
  StateRecord,
  LinearTrendResult,
  PriorityBreakdown,
  PriorityTier,
  CivilEngineeringRecommendation,
  IndicatorKey,
  IndicatorMeta,
} from '../types/accident';

// List of Union Territories in 2019
const UNION_TERRITORIES = new Set([
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Delhi',
  'Lakshadweep',
  'Puducherry',
]);

const HILLY_STATES = new Set([
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Uttarakhand',
  'Arunachal Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura',
]);

/**
 * Parses numeric field, converting "NA" or empty string to null.
 * Validates range and preserves exact precision.
 */
function parseNullableNumber(val: string | undefined): number | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (trimmed === 'NA' || trimmed === 'N/A' || trimmed === '' || trimmed === '-') {
    return null;
  }
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
}

function parseRequiredNumber(val: string | undefined, fallback = 0): number {
  const parsed = parseNullableNumber(val);
  return parsed !== null ? parsed : fallback;
}

/**
 * Parse CSV line handling potential quoted columns
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Compute Ordinary Least Squares (OLS) Linear Regression for 2016-2019 (years 0, 1, 2, 3)
 */
export function calculateLinearTrend(values: [number, number, number, number]): LinearTrendResult {
  const x = [0, 1, 2, 3]; // 2016=0, 2017=1, 2018=2, 2019=3
  const y = values;
  const n = 4;

  const sumX = x.reduce((a, b) => a + b, 0); // 6
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, curr, idx) => acc + curr * y[idx], 0);
  const sumXX = x.reduce((acc, curr) => acc + curr * curr, 0); // 14

  const denominator = n * sumXX - sumX * sumX; // 4 * 14 - 36 = 20
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Goodness of fit R²
  const meanY = sumY / n;
  const ssTotal = y.reduce((acc, curr) => acc + Math.pow(curr - meanY, 2), 0);
  const ssRes = y.reduce((acc, curr, idx) => {
    const fitted = slope * x[idx] + intercept;
    return acc + Math.pow(curr - fitted, 2);
  }, 0);

  const rSquared = ssTotal === 0 ? 1 : Math.max(0, Math.min(1, 1 - ssRes / ssTotal));
  const projected2020 = Math.max(0, Math.round(slope * 4 + intercept)); // x=4 for 2020

  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (slope > 25) direction = 'increasing';
  else if (slope < -25) direction = 'decreasing';

  const annualAverageDelta = Math.round(slope);

  return {
    slope,
    intercept,
    rSquared,
    projected2020,
    direction,
    annualAverageDelta,
  };
}

/**
 * Generate evidence-based civil engineering recommendations strictly grounded in the dataset metrics.
 */
function generateRecommendations(
  state: string,
  accidents2019: number,
  changePct: number,
  popRate: number | null,
  vehRate: number | null,
  roadDensity: number | null,
  isUT: boolean,
  natPopRate: number,
  natVehRate: number,
  natRoadDensity: number
): CivilEngineeringRecommendation[] {
  const recs: CivilEngineeringRecommendation[] = [];

  // 1. High Road Density Recommendation (IRC:SP:88 & IRC:65)
  if (roadDensity !== null && roadDensity > natRoadDensity * 1.3) {
    recs.push({
      id: 'rec-density',
      title: 'High-Density Corridor Black-Spot Identification & Audits',
      category: 'Black-Spot Identification',
      description:
        'Initiate systematic 500-meter corridor black-spot mapping and priority geometry remediation on high-density arterial segments.',
      dataJustification: `Accident density is ${roadDensity.toFixed(1)} crashes per 10,000 km of roads (${(roadDensity / natRoadDensity).toFixed(2)}× national benchmark of ${natRoadDensity.toFixed(1)}), indicating intense collision concentration per route kilometer.`,
      urgency: 'High',
      standardsReference: 'IRC:SP:88 (Manual on Road Safety Audit) & MoRTH Black Spot Protocol',
    });
  }

  // 2. High Vehicle Exposure Rate Recommendation (IRC:99 & IRC:SP:84)
  if (vehRate !== null && vehRate > natVehRate * 1.2) {
    recs.push({
      id: 'rec-veh-rate',
      title: 'Traffic Channelization & Dynamic Speed Calming',
      category: 'Traffic Management',
      description:
        'Deploy physical speed management measures (chicanes, raised pedestrian tables, optical speed bars) and lane-channelization at hazardous conflict points.',
      dataJustification: `The state records ${vehRate.toFixed(2)} accidents per 10,000 registered vehicles (${(vehRate / natVehRate).toFixed(2)}× the all-India average of ${natVehRate.toFixed(2)}), reflecting elevated friction between moving vehicles and highway conflict points.`,
      urgency: 'High',
      standardsReference: 'IRC:99 (Guidelines for Traffic Calming) & IRC:67 (Code of Practice for Road Signs)',
    });
  }

  // 3. High Population Rate Recommendation (IRC:103)
  if (popRate !== null && popRate > natPopRate * 1.25) {
    recs.push({
      id: 'rec-pop-rate',
      title: 'Vulnerable Road User (VRU) & Pedestrian Infrastructure Overhaul',
      category: 'Pedestrian Safety',
      description:
        'Construct continuous segregated sidewalks, high-visibility mid-block zebra crossings, pedestrian refuge islands, and solar-illuminated night beacons.',
      dataJustification: `Recorded accident rate is ${popRate.toFixed(1)} per lakh population (${(popRate / natPopRate).toFixed(2)}× national average of ${natPopRate.toFixed(1)}), signifying high per-capita collision exposure across local transit corridors.`,
      urgency: 'High',
      standardsReference: 'IRC:103 (Guidelines for Pedestrian Facilities)',
    });
  }

  // 4. Upward Trend Momentum Recommendation (MoRTH RS Audits)
  if (changePct > 5) {
    recs.push({
      id: 'rec-trend-up',
      title: 'Corridor Safety Audit & Targeted Enforcement Intervention',
      category: 'Road Safety Audit',
      description:
        'Conduct immediate multi-disciplinary safety reviews on top-tier state highways showing positive crash growth, coupled with automated speed detection systems.',
      dataJustification: `Total recorded accidents increased by +${changePct.toFixed(1)}% between 2016 and 2019 (contrasting with the national decline of -6.58%), indicating emerging infrastructure or operational friction.`,
      urgency: 'High',
      standardsReference: 'IRC:SP:88 (Road Safety Audit) & Motor Vehicles Amendment Act §136A',
    });
  }

  // 5. Urbanized UT / High Density City Recommendation (IRC:93 & ITS)
  if (isUT || (roadDensity !== null && roadDensity > 2000)) {
    recs.push({
      id: 'rec-urban-junction',
      title: 'Urban Intersection Geometric Redesign & Adaptive Traffic Control',
      category: 'Junction Improvement',
      description:
        'Redesign complex multi-leg intersections with dedicated turning pockets, pedestrian leading phases, and radar-linked Intelligent Transportation Systems (ITS).',
      dataJustification: `Urbanized road layout with compact network density (${roadDensity ? roadDensity.toFixed(1) : 'Urban UT'} accidents/10,000 km) concentrates vehicular and non-motorized interactions at critical signalized and unsignalized junctions.`,
      urgency: 'Medium',
      standardsReference: 'IRC:93 (Guidelines on Design of Intersections in Urban Areas)',
    });
  }

  // 6. Mountainous Terrain Specifics (IRC:SP:99 & IRC:52)
  if (HILLY_STATES.has(state)) {
    recs.push({
      id: 'rec-mountain-geom',
      title: 'Hill Road Geometric Realignment & Crash Barrier Installations',
      category: 'Geometry & Signage',
      description:
        'Install W-beam and thrie-beam steel crash barriers on valley-side curves, realign sub-standard blind hairpin turns, and improve retroreflective delineation.',
      dataJustification: `Terrain-induced geometric constraints in mountainous topography require specialized barrier containment systems, superelevation correction, and adverse-weather retroreflectivity.`,
      urgency: 'High',
      standardsReference: 'IRC:52 (Recommendations for Hill Roads) & IRC:SP:99 (Crash Barrier Design)',
    });
  }

  // 7. High Absolute Crash Volume (Tamil Nadu, MP, UP, Karnataka, Kerala, Maharashtra)
  if (accidents2019 > 30000) {
    recs.push({
      id: 'rec-its-surveillance',
      title: 'Intelligent Transportation Systems (ITS) & Corridor Incident Management',
      category: 'Intelligent Transportation Systems',
      description:
        'Deploy automated speed enforcement corridors, ANPR camera networks, variable message signs (VMS), and centralized trauma-response dispatching.',
      dataJustification: `Handling over 30,000 annual crashes (${accidents2019.toLocaleString()} in 2019) requires continuous automated operational monitoring to shorten response times and mitigate high-speed multi-vehicle pileups.`,
      urgency: 'Medium',
      standardsReference: 'MoRTH ITS Architecture & IRC:SP:102',
    });
  }

  // 8. Baseline Pavement & Site-level Investigation (for all)
  recs.push({
    id: 'rec-site-inv',
    title: 'Pavement Skid-Resistance Testing & Micro-Texture Investigation',
    category: 'Site-Level Investigation',
    description:
      'Perform periodic British Pendulum Number (BPN) testing and laser profilometry on approach lanes to identify polished aggregates and wet-weather loss of skid resistance.',
    dataJustification:
      'Baseline preventative civil engineering inspection ensuring pavement surface friction meets minimum statutory grip thresholds regardless of regional volume variation.',
    urgency: 'Routine',
    standardsReference: 'IRC:SP:87 (Manual for Pavement Friction & Skid Resistance Measurement)',
  });

  return recs;
}

/**
 * Generate clear, honest engineering interpretation strictly without unsupported claims.
 */
function generateEngineeringInterpretation(
  state: string,
  accidents2016: number,
  accidents2019: number,
  changePct: number,
  popRate: number | null,
  vehRate: number | null,
  roadDensity: number | null,
  natPopRate: number,
  natVehRate: number,
  natRoadDensity: number
): string {
  const trendWord =
    changePct < -1 ? 'decreased' : changePct > 1 ? 'increased' : 'remained stable';
  const changeMagnitude = Math.abs(changePct).toFixed(1);

  const popRateText =
    popRate !== null
      ? `${popRate.toFixed(1)} accidents per lakh population (${
          popRate > natPopRate
            ? `${(popRate / natPopRate).toFixed(2)}× above national benchmark of ${natPopRate.toFixed(1)}`
            : `${(natPopRate / popRate).toFixed(2)}× below national benchmark of ${natPopRate.toFixed(1)}`
        })`
      : 'not reported in MoRTH population rate tables';

  const vehRateText =
    vehRate !== null
      ? `${vehRate.toFixed(2)} accidents per 10,000 registered vehicles (${
          vehRate > natVehRate
            ? `${(vehRate / natVehRate).toFixed(2)}× above national baseline of ${natVehRate.toFixed(2)}`
            : `${(natVehRate / vehRate).toFixed(2)}× below national baseline of ${natVehRate.toFixed(2)}`
        })`
      : 'unreported in vehicle fleet rate records';

  const roadDensityText =
    roadDensity !== null
      ? `${roadDensity.toFixed(1)} crashes per 10,000 km of roads (national: ${natRoadDensity.toFixed(1)})`
      : 'unrecorded in road length tables';

  return `Between 2016 and 2019, recorded road accident counts in ${state} ${trendWord} by ${changeMagnitude}% (from ${accidents2016.toLocaleString()} to ${accidents2019.toLocaleString()}). In normalized terms, the 2019 accident rate per lakh population was ${popRateText}, while the vehicular exposure rate was ${vehRateText}. Road network accident density stood at ${roadDensityText}. Civil engineering prioritization must therefore evaluate normalized exposure and network density in tandem, avoiding reliance on raw accident totals alone.`;
}

/**
 * Complete parsed, validated and preprocessed dataset
 */
export function loadAndPreprocessAccidentData(): {
  states: StateRecord[];
  nationalTotal: StateRecord;
  nationalAverages: {
    totalAccidents2019: number;
    popRate2019: number;
    vehRate2019: number;
    roadDensity2018P: number;
    fourYearChangePct: number;
  };
} {
  const lines = RAW_CSV_DATA.trim().split('\n');
  const rawRows: RawCsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 21) continue;

    const row: RawCsvRow = {
      state: cols[0],
      accidents2016: parseRequiredNumber(cols[1]),
      accidents2017: parseRequiredNumber(cols[2]),
      accidents2018: parseRequiredNumber(cols[3]),
      accidents2019: parseRequiredNumber(cols[4]),
      rank2019: parseNullableNumber(cols[5]),
      share2016: parseRequiredNumber(cols[6]),
      share2017: parseRequiredNumber(cols[7]),
      share2018: parseRequiredNumber(cols[8]),
      share2019: parseRequiredNumber(cols[9]),
      ratePerLakhPop2016: parseNullableNumber(cols[10]),
      ratePerLakhPop2017: parseNullableNumber(cols[11]),
      ratePerLakhPop2018: parseNullableNumber(cols[12]),
      ratePerLakhPop2019: parseNullableNumber(cols[13]),
      ratePer10kVehicles2016: parseNullableNumber(cols[14]),
      ratePer10kVehicles2017: parseNullableNumber(cols[15]),
      ratePer10kVehicles2018: parseNullableNumber(cols[16]),
      ratePer10kVehicles2019: parseNullableNumber(cols[17]),
      densityPer10kKmRoads2016: parseNullableNumber(cols[18]),
      densityPer10kKmRoads2017: parseNullableNumber(cols[19]),
      densityPer10kKmRoads2018P: parseNullableNumber(cols[20]),
    };

    rawRows.push(row);
  }

  // Separate "Total " row
  const totalRow = rawRows.find((r) => r.state.trim().toLowerCase() === 'total');
  const stateRows = rawRows.filter((r) => r.state.trim().toLowerCase() !== 'total');

  // National benchmarks from government "Total" row
  const natPopRate = totalRow?.ratePerLakhPop2019 ?? 34.2164;
  const natVehRate = totalRow?.ratePer10kVehicles2019 ?? 15.1083;
  const natRoadDensity = totalRow?.densityPer10kKmRoads2018P ?? 930.2533;
  const natTotal2019 = totalRow?.accidents2019 ?? 449002;
  const natTotal2016 = totalRow?.accidents2016 ?? 480652;
  const natFourYearChangePct = ((natTotal2019 - natTotal2016) / natTotal2016) * 100;

  // Calculate Extrema for Min-Max Normalization across valid states
  const validPopRates = stateRows
    .map((s) => s.ratePerLakhPop2019)
    .filter((v): v is number => v !== null);
  const minPopRate = Math.min(...validPopRates);
  const maxPopRate = Math.max(...validPopRates);

  const validVehRates = stateRows
    .map((s) => s.ratePer10kVehicles2019)
    .filter((v): v is number => v !== null);
  const minVehRate = Math.min(...validVehRates);
  const maxVehRate = Math.max(...validVehRates);

  const validRoadDensities = stateRows
    .map((s) => s.densityPer10kKmRoads2018P)
    .filter((v): v is number => v !== null);
  const minRoadDensity = Math.min(...validRoadDensities);
  const maxRoadDensity = Math.max(...validRoadDensities);

  // Compute 2016-to-2019 percentage change for each state
  const stateChanges = stateRows.map(
    (s) => ((s.accidents2019 - s.accidents2016) / s.accidents2016) * 100
  );
  const minChange = Math.min(...stateChanges);
  const maxChange = Math.max(...stateChanges);

  // Process all states
  const processedStates: StateRecord[] = stateRows.map((row) => {
    const isUT = UNION_TERRITORIES.has(row.state);
    const change2016to2019Pct =
      row.accidents2016 > 0
        ? ((row.accidents2019 - row.accidents2016) / row.accidents2016) * 100
        : 0;
    const change2018to2019Pct =
      row.accidents2018 > 0
        ? ((row.accidents2019 - row.accidents2018) / row.accidents2018) * 100
        : 0;

    const trend = calculateLinearTrend([
      row.accidents2016,
      row.accidents2017,
      row.accidents2018,
      row.accidents2019,
    ]);

    // Normalized components [0, 1]
    const popRateNorm =
      row.ratePerLakhPop2019 !== null && maxPopRate > minPopRate
        ? (row.ratePerLakhPop2019 - minPopRate) / (maxPopRate - minPopRate)
        : null;

    const vehicleRateNorm =
      row.ratePer10kVehicles2019 !== null && maxVehRate > minVehRate
        ? (row.ratePer10kVehicles2019 - minVehRate) / (maxVehRate - minVehRate)
        : null;

    const roadDensityNorm =
      row.densityPer10kKmRoads2018P !== null && maxRoadDensity > minRoadDensity
        ? (row.densityPer10kKmRoads2018P - minRoadDensity) / (maxRoadDensity - minRoadDensity)
        : null;

    const trendMomentumNorm =
      maxChange > minChange
        ? (change2016to2019Pct - minChange) / (maxChange - minChange)
        : 0.5;

    // Weighted dynamic combination with missing value re-weighting
    // Default weights: Pop (0.30), Vehicle (0.30), Road Density (0.25), Trend (0.15)
    let weightSum = 0.15; // trend is always known
    let weightedVal = trendMomentumNorm * 0.15;

    let wPop = 0;
    let wVeh = 0;
    let wRoad = 0;
    const wTrend = 0.15;

    if (popRateNorm !== null) {
      wPop = 0.3;
      weightSum += 0.3;
      weightedVal += popRateNorm * 0.3;
    }
    if (vehicleRateNorm !== null) {
      wVeh = 0.3;
      weightSum += 0.3;
      weightedVal += vehicleRateNorm * 0.3;
    }
    if (roadDensityNorm !== null) {
      wRoad = 0.25;
      weightSum += 0.25;
      weightedVal += roadDensityNorm * 0.25;
    }

    // Final score 0 to 100
    const rawScore = (weightedVal / weightSum) * 100;
    const priorityScore = Math.round(Math.max(0, Math.min(100, rawScore)) * 10) / 10;

    let priorityTier: PriorityTier = 'MEDIUM PRIORITY';
    if (priorityScore >= 55) priorityTier = 'HIGH PRIORITY';
    else if (priorityScore < 30) priorityTier = 'LOW PRIORITY';

    // Reasons based strictly on dataset values
    const reasons: string[] = [];
    if (row.ratePer10kVehicles2019 !== null && row.ratePer10kVehicles2019 > natVehRate * 1.3) {
      reasons.push(
        `High vehicle-exposure rate: ${row.ratePer10kVehicles2019.toFixed(1)} crashes per 10k vehicles (national: ${natVehRate.toFixed(1)})`
      );
    }
    if (
      row.densityPer10kKmRoads2018P !== null &&
      row.densityPer10kKmRoads2018P > natRoadDensity * 1.4
    ) {
      reasons.push(
        `Dense route hazard concentration: ${row.densityPer10kKmRoads2018P.toFixed(1)} crashes per 10k km roads (national: ${natRoadDensity.toFixed(1)})`
      );
    }
    if (row.ratePerLakhPop2019 !== null && row.ratePerLakhPop2019 > natPopRate * 1.5) {
      reasons.push(
        `Elevated per-capita incidence: ${row.ratePerLakhPop2019.toFixed(1)} per lakh population (national: ${natPopRate.toFixed(1)})`
      );
    }
    if (change2016to2019Pct > 10) {
      reasons.push(
        `Upward accident growth momentum (+${change2016to2019Pct.toFixed(1)}% between 2016 and 2019)`
      );
    }
    if (reasons.length === 0) {
      if (priorityTier === 'LOW PRIORITY') {
        reasons.push('Low normalized rates across population, fleet, and road length indicators.');
      } else {
        reasons.push('Moderate collision exposure across population and road network indices.');
      }
    }

    const priority: PriorityBreakdown = {
      score: priorityScore,
      tier: priorityTier,
      components: {
        popRateNorm,
        vehicleRateNorm,
        roadDensityNorm,
        trendMomentumNorm,
      },
      weights: {
        popRate: wPop / weightSum,
        vehicleRate: wVeh / weightSum,
        roadDensity: wRoad / weightSum,
        trendMomentum: wTrend / weightSum,
      },
      reasons,
    };

    const recommendations = generateRecommendations(
      row.state,
      row.accidents2019,
      change2016to2019Pct,
      row.ratePerLakhPop2019,
      row.ratePer10kVehicles2019,
      row.densityPer10kKmRoads2018P,
      isUT,
      natPopRate,
      natVehRate,
      natRoadDensity
    );

    const engineeringInterpretation = generateEngineeringInterpretation(
      row.state,
      row.accidents2016,
      row.accidents2019,
      change2016to2019Pct,
      row.ratePerLakhPop2019,
      row.ratePer10kVehicles2019,
      row.densityPer10kKmRoads2018P,
      natPopRate,
      natVehRate,
      natRoadDensity
    );

    return {
      ...row,
      isUT,
      isTotal: false,
      change2016to2019Pct,
      change2018to2019Pct,
      trend,
      priority,
      recommendations,
      engineeringInterpretation,
    };
  });

  // Process Total Row
  const totalRecord: StateRecord = {
    state: 'All India Total',
    accidents2016: natTotal2016,
    accidents2017: totalRow?.accidents2017 ?? 464910,
    accidents2018: totalRow?.accidents2018 ?? 467044,
    accidents2019: natTotal2019,
    rank2019: null,
    share2016: 100,
    share2017: 100,
    share2018: 100,
    share2019: 100,
    ratePerLakhPop2016: totalRow?.ratePerLakhPop2016 ?? 37.88,
    ratePerLakhPop2017: totalRow?.ratePerLakhPop2017 ?? 36.22,
    ratePerLakhPop2018: totalRow?.ratePerLakhPop2018 ?? 35.98,
    ratePerLakhPop2019: natPopRate,
    ratePer10kVehicles2016: totalRow?.ratePer10kVehicles2016 ?? 20.9,
    ratePer10kVehicles2017: totalRow?.ratePer10kVehicles2017 ?? 18.35,
    ratePer10kVehicles2018: totalRow?.ratePer10kVehicles2018 ?? 17.11,
    ratePer10kVehicles2019: natVehRate,
    densityPer10kKmRoads2016: totalRow?.densityPer10kKmRoads2016 ?? 1021.95,
    densityPer10kKmRoads2017: totalRow?.densityPer10kKmRoads2017 ?? 1021.95,
    densityPer10kKmRoads2018P: natRoadDensity,
    isUT: false,
    isTotal: true,
    change2016to2019Pct: natFourYearChangePct,
    change2018to2019Pct: (((natTotal2019 - (totalRow?.accidents2018 ?? 467044)) / (totalRow?.accidents2018 ?? 467044)) * 100),
    trend: calculateLinearTrend([
      natTotal2016,
      totalRow?.accidents2017 ?? 464910,
      totalRow?.accidents2018 ?? 467044,
      natTotal2019,
    ]),
    priority: {
      score: 50,
      tier: 'MEDIUM PRIORITY',
      components: {
        popRateNorm: 0.5,
        vehicleRateNorm: 0.5,
        roadDensityNorm: 0.5,
        trendMomentumNorm: 0.5,
      },
      weights: {
        popRate: 0.3,
        vehicleRate: 0.3,
        roadDensity: 0.25,
        trendMomentum: 0.15,
      },
      reasons: ['Represents aggregated national baseline values across all States and UTs.'],
    },
    recommendations: [],
    engineeringInterpretation: `Nationally across India, total recorded accidents declined by ${Math.abs(natFourYearChangePct).toFixed(2)}% from 480,652 in 2016 to 449,002 in 2019. The national rate stands at 34.22 accidents per lakh population, 15.11 accidents per 10,000 vehicles, and 930.25 crashes per 10,000 km of road network.`,
  };

  return {
    states: processedStates,
    nationalTotal: totalRecord,
    nationalAverages: {
      totalAccidents2019: natTotal2019,
      popRate2019: natPopRate,
      vehRate2019: natVehRate,
      roadDensity2018P: natRoadDensity,
      fourYearChangePct: natFourYearChangePct,
    },
  };
}

export const INDICATOR_METAS: Record<IndicatorKey, IndicatorMeta> = {
  accidents2019: {
    key: 'accidents2019',
    label: 'Total Accidents (2019)',
    shortLabel: 'Accident Count',
    unit: 'crashes',
    description: 'Raw recorded accident count during 2019 from police records.',
    higherIsBetter: false,
    nationalValue2019: 449002,
  },
  ratePerLakhPop2019: {
    key: 'ratePerLakhPop2019',
    label: 'Accidents per Lakh Population (2019)',
    shortLabel: 'Per Lakh Pop',
    unit: 'crashes / 100k people',
    description: 'Normalized crash rate accounting for demographic population exposure.',
    higherIsBetter: false,
    nationalValue2019: 34.22,
  },
  ratePer10kVehicles2019: {
    key: 'ratePer10kVehicles2019',
    label: 'Accidents per 10,000 Vehicles (2019)',
    shortLabel: 'Per 10k Vehicles',
    unit: 'crashes / 10k vehicles',
    description: 'Normalized rate measuring crash frequency per registered vehicle fleet.',
    higherIsBetter: false,
    nationalValue2019: 15.11,
  },
  densityPer10kKmRoads2018P: {
    key: 'densityPer10kKmRoads2018P',
    label: 'Accidents per 10,000 km Roads (2018P)',
    shortLabel: 'Per 10k km Roads',
    unit: 'crashes / 10k km roads',
    description: 'Road network spatial density indicating collision concentration per route length.',
    higherIsBetter: false,
    nationalValue2019: 930.25,
  },
  change2016to2019Pct: {
    key: 'change2016to2019Pct',
    label: '4-Year Trend Change 2016–2019',
    shortLabel: '4-Yr % Change',
    unit: '%',
    description: 'Percentage change in total recorded accidents between 2016 and 2019.',
    higherIsBetter: false,
    nationalValue2019: -6.58,
  },
};
