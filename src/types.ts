export type TradingSignalType = "CALL / UP 🟢" | "PUT / DOWN 🔴" | "NEUTRAL (Do Not Trade)";

export interface SequentialSignal {
  candleIndex: number;
  entryTime: string;
  signal: string;
  confidence: string;
  rationale: string;
}

export interface AnalysisResult {
  signal: string;
  confidenceLevel: string;
  nextCandleDuration: string;
  analysisReasoning: string;
  riskWarning: string;
  candlestickPatterns: string;
  trendMomentum: string;
  supportResistance: string;
  indicators: string;
  sequentialSignals?: SequentialSignal[];
  detectedAsset?: string;
  detectedTimeframe?: string;
}

export interface TradeLog {
  id: string;
  timestamp: number;
  asset: string;
  timeframe: string;
  signal: string;
  confidence: string;
  duration: string;
  analysisReasoning: string;
  candlestickPatterns: string;
  trendMomentum: string;
  supportResistance: string;
  indicators: string;
  riskWarning: string;
  screenshot: string;
  outcome: "ITM" | "OTM" | "PENDING" | "UNEXECUTED";
  stakeAmount: number;
  potentialPayout: number;
}
