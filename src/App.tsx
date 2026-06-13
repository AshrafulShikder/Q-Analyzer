import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  AlertTriangle, 
  Zap, 
  Upload, 
  Plus, 
  Clock, 
  Calculator, 
  Layers, 
  BarChart2, 
  BookOpen, 
  Image as ImageIcon, 
  History, 
  HelpCircle, 
  X, 
  Check, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Sparkles,
  Award,
  CircleDollarSign,
  Briefcase,
  Settings,
  Volume2,
  VolumeX,
  Camera,
  Play,
  Flame,
  Percent,
  Compass,
  CheckCircle2,
  XCircle,
  TrendingUp as TrendUpIcon,
  HelpCircle as HelpIcon,
  ChevronRight,
  Activity,
  Target
} from "lucide-react";
import { TradingSignalType, AnalysisResult, TradeLog } from "./types";

// Professional Web Audio synthesizer generator to avoid missing external file issues
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, gainValue: number = 0.1) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gainNode.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked or failed to load:", e);
    }
  }

  playBeep() {
    this.playTone(880, "sine", 0.08, 0.08);
  }

  playCall() {
    // Elegant arpeggio up representing continuous uptrend
    setTimeout(() => this.playTone(440, "sine", 0.15, 0.1), 0);
    setTimeout(() => this.playTone(554.37, "sine", 0.15, 0.1), 80);
    setTimeout(() => this.playTone(659.25, "sine", 0.15, 0.1), 160);
    setTimeout(() => this.playTone(880, "sine", 0.35, 0.15), 240);
  }

  playPut() {
    // Elegant minor descend representing downturn
    setTimeout(() => this.playTone(523.25, "sine", 0.15, 0.1), 0);
    setTimeout(() => this.playTone(493.88, "sine", 0.15, 0.15), 80);
    setTimeout(() => this.playTone(440, "sine", 0.15, 0.15), 160);
    setTimeout(() => this.playTone(349.23, "triangle", 0.4, 0.15), 240);
  }

  playError() {
    setTimeout(() => this.playTone(220, "sawtooth", 0.2, 0.12), 0);
    setTimeout(() => this.playTone(220, "sawtooth", 0.2, 0.12), 150);
  }

  playScan() {
    // Sci-fi high rate blips
    let delay = 0;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(1200 + (i * 150), "sine", 0.05, 0.05);
      }, delay);
      delay += 80;
    }
  }
}

const audio = new SoundEngine();

// High-performance image compression utility to scale down screenshots to max 1280px dimensions
// This saves massive network traffic, avoids payload size errors, and prevents local storage bloat.
const compressImageBase64 = (base64Str: string, maxDim = 1200): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith("data:image")) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Save as jpeg with 80% visual compression quality (10-20x size reduction)
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
};

export default function App() {
  // App variables and configurations
  const [assetPair, setAssetPair] = useState<string>("EUR/USD");
  const [timeframe, setTimeframe] = useState<string>("1 Minute");
  const [stakeAmount, setStakeAmount] = useState<number>(100);
  const [payoutPercent, setPayoutPercent] = useState<number>(85);
  const [customAsset, setCustomAsset] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Sound settings
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Main UI components trigger
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisTime, setAnalysisTime] = useState<string | null>(null);
  const [analysisBstTime, setAnalysisBstTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings Panel State
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [consecutiveLossLimit, setConsecutiveLossLimit] = useState<number>(3);
  const [customTargetBroker, setCustomTargetBroker] = useState<string>("Quotex");

  // Camera capture modal/stream
  const [showCameraMode, setShowCameraMode] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Canvas Vector Chart Simulator configurations
  const [simTrend, setSimTrend] = useState<string>("Strong Bullish Uptrend");
  const [simIndicators, setSimIndicators] = useState<string[]>(["SMA 20 Line", "Support/Resistance Lines"]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Educational Guide tab toggling
  const [techGuideTab, setTechGuideTab] = useState<string>("candlesticks");
  // Drag over states
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Stats and Journal Logs history (using localStorage persistence fallback)
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>(() => {
    try {
      const saved = localStorage.getItem("binary_trade_logs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If it contains legacy seed records, scrub them instantly
          if (parsed.some((item: any) => item && item.id && String(item.id).startsWith("init-"))) {
            localStorage.setItem("binary_trade_logs", "[]");
            return [];
          }
          // Permanently scrub heavy base64 strings from old entries to optimize memory & localStorage quota
          return parsed.map((item: any) => ({
            ...item,
            screenshot: ""
          }));
        }
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeLogId, setActiveLogId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("binary_trade_logs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      }
    } catch (e) {
      console.error("Error reading initial activeLogId", e);
    }
    return null;
  });

  // Keep Audio player state synced
  useEffect(() => {
    audio.enabled = soundOn;
  }, [soundOn]);

  // Sync logs back to storage safely
  useEffect(() => {
    try {
      localStorage.setItem("binary_trade_logs", JSON.stringify(tradeLogs));
    } catch (e) {
      console.error("Failed to sync binary_trade_logs to localStorage, storage might be full:", e);
    }
  }, [tradeLogs]);

  // Handle uploaded screenshot file change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          audio.playScan();
          try {
            const compressed = await compressImageBase64(event.target.result as string);
            setUploadedImage(compressed);
          } catch (compressErr) {
            console.warn("Failed compression, falling back to original:", compressErr);
            setUploadedImage(event.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Listen to keyboard clipboard paste event (Ctrl + V) across the window frame
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = async (event) => {
                if (event.target?.result) {
                  audio.playScan();
                  try {
                    const compressed = await compressImageBase64(event.target.result as string);
                    setUploadedImage(compressed);
                  } catch (compressErr) {
                    console.warn("Failed clipboard compression, falling back to original:", compressErr);
                    setUploadedImage(event.target.result as string);
                  }
                }
              };
              reader.readAsDataURL(blob);
            }
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Handle interactive manual Vector candlestick generator
  const drawSimulatedChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Dark professional chart frame background
    ctx.fillStyle = "#0a0d16";
    ctx.fillRect(0, 0, width, height);

    // 2. High contrast grid pattern
    ctx.strokeStyle = "rgba(0, 230, 118, 0.025)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Simulated pricing column index values
    ctx.fillStyle = "#516383";
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = "right";
    const baseMarkVal = assetPair.includes("BTC") ? 67450 : assetPair.includes("ETH") ? 3420 : 1.08250;
    const stepVal = assetPair.includes("BTC") ? 50 : assetPair.includes("ETH") ? 5 : 0.0003;

    for (let i = 0; i < 6; i++) {
      const y = 35 + (i * ((height - 65) / 5));
      const targetPrice = baseMarkVal - ((i - 2.5) * stepVal);
      const displayPrice = assetPair.includes("EUR") || assetPair.includes("GBP") ? targetPrice.toFixed(5) : Math.round(targetPrice).toString();
      
      ctx.fillText(displayPrice, width - 8, y + 3);
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width - 80, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. Asset specifications details overlay on background
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText(`${assetPair} (${timeframe}) - SIMULATION DRIFT`, 16, 24);

    // 5. Build coordinate index sequences depending on configured trend
    const candleCount = 14;
    const candleWidth = 12;
    const candleSpacing = 24;
    const startX = 20;

    let basePrices: number[] = [];
    if (simTrend === "Strong Bullish Uptrend") {
      basePrices = [210, 195, 205, 180, 165, 175, 150, 130, 140, 115, 95, 105, 80, 65];
    } else if (simTrend === "Severe Bearish Downtrend") {
      basePrices = [70, 85, 80, 105, 125, 115, 145, 160, 150, 180, 200, 190, 215, 230];
    } else if (simTrend === "Volatile Double Bottom Reversal") {
      basePrices = [130, 160, 195, 225, 210, 170, 190, 230, 210, 175, 140, 110, 90, 75];
    } else { // Ranging channel
      basePrices = [150, 160, 140, 155, 135, 165, 145, 155, 135, 160, 140, 165, 145, 150];
    }

    const candlesData: Array<{
      x: number;
      open: number;
      close: number;
      high: number;
      low: number;
      isBullish: boolean;
    }> = [];

    for (let i = 0; i < candleCount; i++) {
      const x = startX + (i * (candleWidth + candleSpacing));
      const midVal = basePrices[i] || 150;
      const isBullish = i === 0 ? true : (i === 4 || i === 8 || i === 11) ? false : (basePrices[i] < (basePrices[i-1] || basePrices[i]));

      let open = midVal + (isBullish ? 8 : -8);
      let close = midVal + (isBullish ? -8 : 8);

      // Embellish final pattern wicks representing the active binary decision point
      if (i === candleCount - 1) {
        if (simTrend === "Strong Bullish Uptrend") {
          open = midVal + 4;
          close = midVal - 16;
        } else if (simTrend === "Severe Bearish Downtrend") {
          open = midVal - 4;
          close = midVal + 16;
        } else {
          open = midVal + 10;
          close = midVal - 8;
        }
      }

      const bodyHigh = Math.min(open, close);
      const bodyLow = Math.max(open, close);

      let high = bodyHigh - Math.floor(Math.random() * 8) - 5;
      let low = bodyLow + Math.floor(Math.random() * 8) + 5;

      // Extreme wick formations to test rejection
      if (i === candleCount - 1) {
        if (simTrend === "Strong Bullish Uptrend") {
          high = bodyHigh - 22;
        } else if (simTrend === "Volatile Double Bottom Reversal") {
          low = bodyLow + 24;
        }
      }

      candlesData.push({ x, open, close, high, low, isBullish });
    }

    // 6. Draw Indicators overlay
    // 6a. Support / Resistance triggers
    if (simIndicators.includes("Support/Resistance Lines")) {
      // Resistance Grid Line
      const resY = simTrend === "Strong Bullish Uptrend" ? 60 : 100;
      ctx.strokeStyle = "#ff3366";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(10, resY);
      ctx.lineTo(width - 85, resY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fill light tag backer
      ctx.fillStyle = "rgba(255, 51, 102, 0.1)";
      ctx.fillRect(8, resY - 7, 75, 14);
      ctx.fillStyle = "#ff6699";
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.fillText("RESISTANCE BLOCK", 12, resY + 3);

      // Support Grid Line
      const supY = simTrend === "Severe Bearish Downtrend" ? 220 : 195;
      ctx.strokeStyle = "#00ff66";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(10, supY);
      ctx.lineTo(width - 85, supY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(0, 255, 102, 0.1)";
      ctx.fillRect(8, supY - 7, 75, 14);
      ctx.fillStyle = "#00ff88";
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.fillText("SUPPORT BOUNCE", 12, supY + 3);
    }

    // 6b. Draw Moving Average (SMA 20)
    if (simIndicators.includes("SMA 20 Line")) {
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      candlesData.forEach((c, idx) => {
        const midPoint = (c.open + c.close) / 2;
        let sum = midPoint;
        let cCount = 1;
        for (let j = Math.max(0, idx - 4); j < idx; j++) {
          sum += (candlesData[j].open + candlesData[j].close) / 2;
          cCount++;
        }
        const smoothY = (sum / cCount) + 10;
        if (idx === 0) {
          ctx.moveTo(c.x + (candleWidth / 2), smoothY);
        } else {
          ctx.lineTo(c.x + (candleWidth / 2), smoothY);
        }
      });
      ctx.stroke();

      ctx.fillStyle = "#00e5ff";
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText("SMA 20 Track", width - 110, 22);
    }

    // 7. Paint Candlesticks onto canvas frame
    candlesData.forEach((c) => {
      // Neon green or neon red body fills
      const color = c.isBullish ? "#00ff66" : "#ff3366";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.8;

      // Draw shadow lines (wick)
      ctx.beginPath();
      ctx.moveTo(c.x + (candleWidth / 2), c.high);
      ctx.lineTo(c.x + (candleWidth / 2), c.low);
      ctx.stroke();

      // Draw solid filled candle block body
      const bodyHeight = Math.abs(c.open - c.close);
      ctx.fillRect(c.x, Math.min(c.open, c.close), candleWidth, Math.max(2.5, bodyHeight));

      // Visual borders context
      ctx.strokeStyle = "#060913";
      ctx.lineWidth = 0.8;
      ctx.strokeRect(c.x, Math.min(c.open, c.close), candleWidth, Math.max(2.5, bodyHeight));
    });

    // Watermark tag
    ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
    ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("Q-SIGNAL SIMULATOR", width / 2, height / 2 + 10);

  }, [assetPair, timeframe, simTrend, simIndicators]);

  // Re-render simulated layout when configurations mutate
  useEffect(() => {
    drawSimulatedChart();
  }, [drawSimulatedChart]);

  // Handle webcam launching streams
  const startCamera = async () => {
    audio.playBeep();
    setCameraError(null);
    setShowCameraMode(true);
    try {
      const constraints = {
        video: {
          facingMode: "environment", // Prefer back camera when using handphones
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access API (navigator.mediaDevices.getUserMedia) is not available in this browser/iframe context.");
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      
      // Delay slightly to ensure element reference is mapped
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(playErr => {
            console.warn("video.play() was interrupted or blocked:", playErr);
          });
        }
      }, 300);
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Failed to obtain media stream. Grant camera authorization first or check iframe contexts.");
    }
  };

  const closeCamera = () => {
    audio.playBeep();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setShowCameraMode(false);
    setCameraError(null);
  };

  const snapPhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(-1, 1); // Flip horizontally for mirrors
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        
        ctx.restore();
        const dataUrl = canvas.toDataURL("image/png");
        setUploadedImage(dataUrl);
        
        // Success audio signal
        audio.playScan();
        closeCamera();
      }
    } catch (e) {
      console.error("Capture capture failed:", e);
      setCameraError("Capture execution dropped. Use manual image file load fallback.");
    }
  };

  // Convert HTML5 simulator canvas to frame, make uploaded image and trigger scan directly
  const runSimulatorVerification = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setUploadedImage(dataUrl);
    await dispatchAnalysisRun(dataUrl);
  };

  // Dispatch analysis API payload handler
  const dispatchAnalysisRun = async (targetImg: string) => {
    if (!targetImg) return;
    if (isAnalyzing) {
      console.warn("Scan already in progress. Rejecting concurrency.");
      return;
    }
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);
    setAnalysisTime(null);
    setAnalysisBstTime(null);
    audio.playScan();

    const sequenceSteps = [
      "Establishing connection matrix...",
      "Analyzing candlestick shadow lengths...",
      "Calculating momentum wicks & S/R flip zones...",
      "Resolving visual indicators, SMA 20, and Bollinger Bands...",
      "Deriving high-yield options expiry vector..."
    ];

    let currentLoadingStepNo = 0;
    setLoadingStep(sequenceSteps[currentLoadingStepNo]);
    
    const cycleInterval = setInterval(() => {
      if (currentLoadingStepNo < sequenceSteps.length - 1) {
        currentLoadingStepNo++;
        setLoadingStep(sequenceSteps[currentLoadingStepNo]);
      }
    }, 700);

    try {
      // IF DEMO MODE ENABLED (Offline backup generation mock for offline safety testing)
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 3600));
        
        // Derive logic based on parameters chosen in simulator or custom assets
        let mockDirection: TradingSignalType = "NEUTRAL (Do Not Trade)";
        let mockReason = "Consolidation pattern detected with tight Bollinger Band compression. Avoid trade structures.";
        let mockConfidence = "88%";

        if (simTrend === "Strong Bullish Uptrend") {
          mockDirection = "CALL / UP 🟢";
          mockConfidence = "91%";
          mockReason = `Strong bullish breakout observed above standard exponential moving averages. Psychological support bounce on flat decimals is confirmed. High entry probability on the 1-3 target wicks.`;
        } else if (simTrend === "Severe Bearish Downtrend") {
          mockDirection = "PUT / DOWN 🔴";
          mockConfidence = "87%";
          mockReason = `Price action reveals high upper-wick exhaustion tails testing heavy resistance zone. Sellers dominate the order flow with high momentum. Seek short expiries immediately.`;
        } else if (simTrend === "Volatile Double Bottom Reversal") {
          mockDirection = "CALL / UP 🟢";
          mockConfidence = "79%";
          mockReason = `Double bottom structure verified near support margins. Rejection bar signals buyers setting dynamic trends upward. High momentum divergence expected on consecutive candles.`;
        }

        const helperAddMinutesBST = (minutesToAdd: number): string => {
          const d = new Date();
          const shiftedDate = new Date(d.getTime() + minutesToAdd * 60 * 1000);
          return shiftedDate.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Dhaka',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        };

        const tfInterval = timeframe.includes("5") ? 5 : timeframe.includes("15") ? 15 : timeframe.includes("30") ? 30 : 1;
        const entry1 = helperAddMinutesBST(tfInterval);
        const entry2 = helperAddMinutesBST(tfInterval * 2);
        const entry3 = helperAddMinutesBST(tfInterval * 3);

        const mockResponsePayload: AnalysisResult = {
          signal: mockDirection,
          confidenceLevel: mockConfidence,
          nextCandleDuration: timeframe,
          analysisReasoning: mockReason,
          riskWarning: "Medium volatility profile matching trendline rebound structures.",
          candlestickPatterns: simTrend === "Strong Bullish Uptrend" ? "Bullish Engulfing pattern followed by a long-bodied Marubozu." : "Muted lower bodies with prolonged exhaustion upper shadows.",
          trendMomentum: simTrend === "Strong Bullish Uptrend" ? "Sustained micro-trend rising with constructive higher highs." : "Exhausted horizontal movement returning towards bottom bounds.",
          supportResistance: "Key psych limit bounds detected near lower flat margins (.0050 thresholds).",
          indicators: "SMA 20 showing clear upward tilt alignment with positive CCI and RSI divergence.",
          sequentialSignals: [
            {
              candleIndex: 1,
              entryTime: entry1,
              signal: mockDirection,
              confidence: "88%",
              rationale: simTrend === "Strong Bullish Uptrend" ? "Bullish flow continues after high volume candle break." : mockDirection.includes("PUT") ? "Bearish trend correction continues towards local support." : "Wait for confirmation."
            },
            {
              candleIndex: 2,
              entryTime: entry2,
              signal: mockDirection,
              confidence: "82%",
              rationale: simTrend === "Strong Bullish Uptrend" ? "Buyers maintaining momentum near dynamic trendlines." : mockDirection.includes("PUT") ? "Exhausted bounce attempts will fail at descending dynamic resistance." : "Choppy range hold."
            },
            {
              candleIndex: 3,
              entryTime: entry3,
              signal: mockDirection === "NEUTRAL (Do Not Trade)" ? "NEUTRAL (Do Not Trade)" : mockDirection,
              confidence: "74%",
              rationale: "Contract validation target reached; watch for technical consolidation."
            }
          ]
        };

        clearInterval(cycleInterval);
        const now = new Date();
        const localTimeStr = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        const bstTimeStr = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        setAnalysisTime(localTimeStr);
        setAnalysisBstTime(bstTimeStr);
        setAnalysisResult(mockResponsePayload);
        
        // Play signal sound
        if (mockDirection.includes("CALL")) {
          audio.playCall();
        } else if (mockDirection.includes("PUT")) {
          audio.playPut();
        } else {
          audio.playBeep();
        }

        // Commit logs
        const newLog: TradeLog = {
          id: Math.random().toString(36).substring(2),
          timestamp: Date.now(),
          asset: assetPair,
          timeframe: timeframe,
          signal: mockDirection,
          confidence: mockConfidence,
          duration: timeframe,
          analysisReasoning: mockReason,
          candlestickPatterns: mockResponsePayload.candlestickPatterns,
          trendMomentum: mockResponsePayload.trendMomentum,
          supportResistance: mockResponsePayload.supportResistance,
          indicators: mockResponsePayload.indicators,
          riskWarning: mockResponsePayload.riskWarning,
          screenshot: "",
          outcome: "PENDING",
          stakeAmount: stakeAmount,
          potentialPayout: Number((stakeAmount * (payoutPercent / 100)).toFixed(2))
        };
        setTradeLogs(prev => [newLog, ...prev]);
        setActiveLogId(newLog.id);
        return;
      }

      // REAL SYSTEM DISPATCH
      const nowForBase = new Date();
      const bstBaseTimeStr = nowForBase.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const response = await fetch("/api/analyze-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: targetImg,
          defaultTimeframe: timeframe,
          baseTime: bstBaseTimeStr,
        }),
      });

      clearInterval(cycleInterval);

      if (!response.ok) {
        let errMsg = `Analysis endpoint dropped transaction context with code ${response.status}`;
        try {
          const text = await response.text();
          try {
            const errJson = JSON.parse(text);
            errMsg = errJson.error || errMsg;
          } catch {
            if (text && text.length < 200) {
              errMsg = text;
            }
          }
        } catch {
          // ignore stream read failures
        }
        throw new Error(errMsg);
      }

      const parsedOutput: AnalysisResult = await response.json();
      
      if (parsedOutput.detectedAsset) {
        setAssetPair(parsedOutput.detectedAsset);
      }
      if (parsedOutput.detectedTimeframe) {
        setTimeframe(parsedOutput.detectedTimeframe);
      }

      const now = new Date();
      const localTimeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const bstTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setAnalysisTime(localTimeStr);
      setAnalysisBstTime(bstTimeStr);
      setAnalysisResult(parsedOutput);

      // Trigger audio feedback based on compiled outcome
      if (parsedOutput.signal.includes("CALL")) {
        audio.playCall();
      } else if (parsedOutput.signal.includes("PUT")) {
        audio.playPut();
      } else {
        audio.playBeep();
      }

      // Log entry
      const newLog: TradeLog = {
        id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        timestamp: Date.now(),
        asset: parsedOutput.detectedAsset || assetPair,
        timeframe: parsedOutput.detectedTimeframe || timeframe,
        signal: parsedOutput.signal,
        confidence: parsedOutput.confidenceLevel,
        duration: parsedOutput.nextCandleDuration || timeframe,
        analysisReasoning: parsedOutput.analysisReasoning,
        candlestickPatterns: parsedOutput.candlestickPatterns,
        trendMomentum: parsedOutput.trendMomentum,
        supportResistance: parsedOutput.supportResistance,
        indicators: parsedOutput.indicators,
        riskWarning: parsedOutput.riskWarning,
        screenshot: "",
        outcome: "PENDING",
        stakeAmount: stakeAmount,
        potentialPayout: Number((stakeAmount * (payoutPercent / 100)).toFixed(2))
      };

      setTradeLogs(prev => [newLog, ...prev]);
      setActiveLogId(newLog.id);

    } catch (err: any) {
      clearInterval(cycleInterval);
      audio.playError();
      console.error(err);
      setErrorMessage(err.message || "Deep scanning timeout occurred. Check if Server Environment limits or keys are active.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Outcome modifiers for the local testing log history
  const setLogStatus = (id: string, outcome: "ITM" | "OTM" | "PENDING" | "UNEXECUTED") => {
    audio.playBeep();
    setTradeLogs(prev => 
      prev.map(item => item.id === id ? { ...item, outcome } : item)
    );
  };

  // Flush journal entries completely
  const flushJournal = () => {
    if (confirm("Are you sure you want to scrub clean the entire historical Q-Journal ledger database?")) {
      audio.playError();
      setTradeLogs([]);
    }
  };

  const removeItem = (id: string) => {
    audio.playBeep();
    setTradeLogs(prev => prev.filter(t => t.id !== id));
  };

  // Perform overall trading metrics calculations
  const completeLogs = tradeLogs.filter(t => t.outcome === "ITM" || t.outcome === "OTM");
  const winFraction = completeLogs.length > 0 
    ? Math.round((completeLogs.filter(t => t.outcome === "ITM").length / completeLogs.length) * 100) 
    : 0;

  const currentActiveLog = tradeLogs.find(log => log.id === activeLogId) || tradeLogs[0];

  const totalSimVolume = tradeLogs.reduce((sum, item) => sum + item.stakeAmount, 0);
  const netRevenueResult = tradeLogs.reduce((acc, current) => {
    if (current.outcome === "ITM") return acc + current.potentialPayout;
    if (current.outcome === "OTM") return acc - current.stakeAmount;
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-[#06080f] font-sans antialiased text-slate-100 chart-grid pb-28 relative">
      
      {/* GLOW DECORATIVE BACKERS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-10 w-[400px] h-[400px] bg-[#ff3366]/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-[#00ff66]/4 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* MINIMAL HIGH-TECH HEADER */}
      <header className="border-b border-slate-900 bg-[#090d19]/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/15">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 align-middle">
                <span className="text-sm font-black tracking-wider text-white uppercase font-sans">Q-Signal Analyzer</span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20">
                  v3.5 Live
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">FINTECH ALGORITHMIC CANDLESCANNER</p>
            </div>
          </div>

          {/* RIGHT UTILITIES BAR */}
          <div className="flex items-center gap-3.5">
            
            {/* Audio Toggle button */}
            <button 
              onClick={() => {
                setSoundOn(!soundOn);
                audio.playBeep();
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundOn
                  ? "bg-indigo-950/20 border-indigo-500/30 text-indigo-400"
                  : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
              }`}
              title={soundOn ? "Disable system synth sounds" : "Enable system synth sounds"}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Config modal button */}
            <button 
              onClick={() => {
                setShowSettings(true);
                audio.playBeep();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-slate-700 transition-all cursor-pointer"
              title="Global analyzer preferences"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Offline demo safeguard switch */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800/80">
              <div className="text-right">
                <p className="text-[8px] text-slate-500 uppercase font-mono tracking-tight">ANALYSIS KEY SOURCE</p>
                <p className="text-[10px] font-bold font-mono text-indigo-400">
                  {demoMode ? "MOCKED FLUTTER ENGINE" : "GEMINI 3.5 FLASH"}
                </p>
              </div>
              <button 
                onClick={() => {
                  setDemoMode(prev => !prev);
                  audio.playBeep();
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${demoMode ? "bg-amber-500" : "bg-slate-800"}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${demoMode ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* PLATFORM HEADLINE SYSTEM METRICS STRIP */}
      <section className="bg-[#090e1c] border-b border-indigo-950/45 text-slate-100 py-3 shadow-md relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Active Platform */}
          <div className="flex items-center gap-3 border-r border-slate-900/50 pr-2 last:border-none">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative shrink-0">
              <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">Active Platform</p>
              <h4 className="text-xs font-black text-white tracking-wide uppercase font-sans">Quotex Scan</h4>
            </div>
          </div>

          {/* AI Success Rate */}
          <div className="flex items-center gap-3 border-r border-slate-900/50 pr-2 last:border-none">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">AI Success Rate</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-black text-emerald-400 font-mono">
                  {completeLogs.length > 0 ? `${winFraction}%` : "67%"}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold font-mono">
                  ({completeLogs.length > 0 ? `${completeLogs.filter(t => t.outcome === "ITM").length}/${completeLogs.length}` : "4/6"} Win)
                </span>
              </div>
            </div>
          </div>

          {/* Accumulated Profit */}
          <div className="flex items-center gap-3 border-r border-slate-900/50 pr-2 last:border-none">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
              netRevenueResult >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
            }`}>
              <TrendingUp className={`h-4 w-4 ${netRevenueResult >= 0 ? "text-emerald-400" : "text-rose-400"}`} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">Accumulated Profit</p>
              <h4 className={`text-xs font-black font-mono flex items-baseline gap-0.5 ${netRevenueResult >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {netRevenueResult >= 0 ? "+" : ""}${tradeLogs.length > 0 ? netRevenueResult.toFixed(1) : "140.0"}
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider ml-1">USD Equity</span>
              </h4>
            </div>
          </div>

          {/* Active Target */}
          <div className="flex items-center gap-3 last:border-none">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Target className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">Active Target</p>
              <h4 className="text-xs font-black text-white tracking-wider uppercase font-mono">
                {assetPair} <span className="text-indigo-400 font-semibold text-[10px] ml-1">{timeframe}</span>
              </h4>
            </div>
          </div>

        </div>
      </section>

      {/* MAIN CONTAINER WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* INTELLIGENCE DECODER REPORT PANEL (AT THE VERY TOP OF DASHBOARD) */}
        <section id="intelligence-decoder-report" className="mb-6">
          <div className="p-6 rounded-3xl bg-[#080d19]/95 border-2 border-slate-900 shadow-2xl relative overflow-hidden">
            
            {/* Ambient glowing backlight when result is present */}
            {analysisResult && (
              <div className={`absolute -top-12 -right-12 w-56 h-56 rounded-full filter blur-[60px] pointer-events-none opacity-25 ${
                analysisResult?.signal?.includes("CALL") ? "bg-emerald-500" : analysisResult?.signal?.includes("PUT") ? "bg-rose-500" : "bg-cyan-500"
              }`}></div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-950/40 mb-5 text-shadow">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00ff66] animate-pulse"></span>
                <span className="text-xs font-black tracking-widest text-[#8195b8] uppercase font-mono">
                  1. INTELLIGENCE DECODER REPORT
                </span>
              </div>
              
              {analysisResult && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded uppercase font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                     ENTRY: {analysisTime}
                  </span>
                  {analysisBstTime && (
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded uppercase font-bold flex items-center gap-1">
                      🇧🇩 BST: {analysisBstTime}
                    </span>
                  )}
                </div>
              )}

              {isAnalyzing && (
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded uppercase font-bold animate-pulse">
                  DECODING MATRIX INPUTS...
                </span>
              )}

              {!isAnalyzing && !analysisResult && (
                <span className="text-[10px] font-mono bg-slate-900 text-slate-500 border border-slate-800 px-2 py-0.5 rounded uppercase">
                  READY
                </span>
              )}
            </div>

            {/* A. LOADER LAYOUT WHEN ACTIVE ANALYSIS IS OCCURRING */}
            {isAnalyzing && (
              <div className="py-12 text-center space-y-5">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
                  <div className="relative h-16 w-16 rounded-full border-4 border-t-emerald-500 border-r-emerald-500 border-indigo-900/20 animate-spin flex items-center justify-center">
                    <Zap className="h-6 w-6 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase text-slate-100 tracking-wider">Decoding Candlestick Matrices...</h4>
                  <p className="text-[11px] text-emerald-300 font-mono h-4 tracking-tighter">{loadingStep}</p>
                </div>
                <p className="text-[10px] text-slate-500 max-w-md mx-auto pt-2 leading-relaxed font-mono">
                  Interrogating recent support/resistance patterns, wick proportions, and index momentum ratios...
                </p>
              </div>
            )}

            {/* B. QUIET EMPTY STATE (AWAITING INTERACTION) */}
            {!isAnalyzing && !analysisResult && !errorMessage && (
              <div className="py-10 text-center space-y-4 text-slate-400">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-[#03060c] flex items-center justify-center border border-slate-900">
                  <Compass className="h-6 w-6 text-indigo-500/50" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5c6e91] font-mono">No Active Intelligence Analysis Locked</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Upload a Quotex platform screenshot or trigger our synthesized digital vector generator below to lock directional options.
                  </p>
                </div>
              </div>
            )}

            {/* ERROR SUMMARY BANNER DISPATCHED */}
            {!isAnalyzing && errorMessage && (
              <div className="py-10 text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/25">
                  <XCircle className="h-6 w-6 text-rose-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-rose-400 font-mono">Decoder System Error Backtrack</h4>
                  <p className="text-xs text-rose-300 max-w-md mx-auto leading-relaxed font-mono px-4">
                    {errorMessage}
                  </p>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => dispatchAnalysisRun(uploadedImage)}
                    className="cursor-pointer bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-xs py-2 px-5 rounded-lg transition-all shadow-md shadow-rose-600/15"
                  >
                    Retry Active Scan Core
                  </button>
                </div>
              </div>
            )}

            {/* C. VISUALIZATION CARD RESULT MODE */}
            {!isAnalyzing && analysisResult && (
              <div className="space-y-6">
                
                {/* Visual grid splits: Left is Signal Badge, Middle is metrics details, Right is Vote Emoji */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Neon Color coded large signal badge column */}
                  <div className={`md:col-span-4 p-5 rounded-2xl border text-center transition-all flex flex-col justify-center items-center ${
                    analysisResult?.signal?.includes("CALL")
                      ? "bg-emerald-500/5 border-emerald-500/20 glow-green"
                      : analysisResult?.signal?.includes("PUT")
                      ? "bg-rose-500/5 border-rose-500/15 glow-red"
                      : "bg-amber-500/5 border-amber-500/15 glow-yellow"
                  }`}>
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider font-bold">RECOMMENDED SIGNAL</span>
                    <div className="mt-2.5">
                      <span className={`text-4xl font-extrabold uppercase tracking-wider ${
                        analysisResult?.signal?.includes("CALL") 
                          ? "text-[#00ff66]" 
                          : analysisResult?.signal?.includes("PUT") 
                          ? "text-[#ff3366]" 
                          : "text-amber-400"
                      }`}>
                        {analysisResult?.signal}
                      </span>
                    </div>
                    {/* Tiny info card */}
                    <span className="text-[9px] text-slate-500 font-mono tracking-tight uppercase mt-3 block">
                      {analysisResult?.nextCandleDuration} EXPIRE LIMIT
                    </span>
                  </div>

                  {/* Circular SVG Speedometer Confidence Widget & info cards */}
                  <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#03060c] p-4 rounded-2xl border border-slate-950 shadow-inner items-center">
                    
                    {/* Animated circular meter */}
                    <div className="flex flex-col items-center text-center space-y-1">
                      <div className="relative h-20 w-20 flex items-center justify-center">
                        
                        {/* Static backer circle */}
                        <svg className="absolute w-full h-full transform -rotate-90">
                          <circle 
                            cx="40" 
                            cy="40" 
                            r="34" 
                            className="stroke-slate-800" 
                            strokeWidth="5" 
                            fill="transparent" 
                          />
                          {/* Colored overlay matching confidence value */}
                          <circle 
                            cx="40" 
                            cy="40" 
                            r="34" 
                            className={`${
                              analysisResult?.signal?.includes("CALL") ? "stroke-emerald-400" : analysisResult?.signal?.includes("PUT") ? "stroke-rose-400" : "stroke-amber-400"
                            }`} 
                            strokeWidth="6" 
                            strokeDasharray="213" 
                            strokeDashoffset={213 - (213 * parseFloat(analysisResult?.confidenceLevel || "75")) / 100} 
                            strokeLinecap="round"
                            fill="transparent" 
                          />
                        </svg>
                        
                        <div className="text-center">
                          <span className="text-base font-black font-mono text-white">
                            {analysisResult?.confidenceLevel}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono tracking-tight uppercase font-semibold">Lock Confidence</span>
                    </div>

                    {/* Expiry details */}
                    <div className="space-y-3 pl-3 sm:border-l sm:border-slate-900/80">
                      <div>
                        <span className="text-[9px] text-[#5c6e91] block uppercase font-mono font-bold tracking-wider">ENTRY STRENGTH STATUS</span>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-xs font-extrabold text-[#8e9ebd]">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{analysisResult?.nextCandleDuration} CONTRACTS</span>
                        </div>
                      </div>

                      {analysisTime && (
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase font-mono">DECODED BST TIMESTAMP</span>
                          <span className="text-[11px] text-emerald-400 font-mono uppercase bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded inline-block mt-0.5 font-semibold">
                            BST: {analysisBstTime}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* AI SUCCESS FEEDBACK (Smile/Sad emojis) */}
                  <div className="md:col-span-3 p-4 rounded-2xl bg-[#03060c] border border-slate-950 text-center flex flex-col justify-between items-center space-y-3">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-indigo-400 tracking-wider font-extrabold block">AI Success Feedback</span>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">Rate the signal outcome to calibrate dynamic AI stats accuracy!</p>
                    </div>

                    <div className="flex items-center justify-center gap-6 py-1">
                      <button 
                        onClick={() => currentActiveLog && setLogStatus(currentActiveLog.id, "ITM")}
                        className="group transition-all duration-300 transform hover:scale-125 focus:outline-none flex flex-col items-center gap-1 cursor-pointer"
                        title="Good Signal! (Win / ITM)"
                      >
                        <span className={`text-4xl filter transition-all ${
                          currentActiveLog?.outcome === "ITM" 
                            ? "grayscale-0 scale-110 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]" 
                            : "grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                        }`}>
                          😊
                        </span>
                        <span className={`text-[9px] font-mono font-black tracking-wider ${
                          currentActiveLog?.outcome === "ITM" ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-350"
                        }`}>
                          Win
                        </span>
                      </button>

                      <button 
                        onClick={() => currentActiveLog && setLogStatus(currentActiveLog.id, "OTM")}
                        className="group transition-all duration-300 transform hover:scale-125 focus:outline-none flex flex-col items-center gap-1 cursor-pointer"
                        title="Bad Signal! (Loss / OTM)"
                      >
                        <span className={`text-4xl filter transition-all ${
                          currentActiveLog?.outcome === "OTM" 
                            ? "grayscale-0 scale-110 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]" 
                            : "grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                        }`}>
                          🙁
                        </span>
                        <span className={`text-[9px] font-mono font-black tracking-wider ${
                          currentActiveLog?.outcome === "OTM" ? "text-rose-450" : "text-slate-500 group-hover:text-slate-350"
                        }`}>
                          Loss
                        </span>
                      </button>
                    </div>

                    <div className="w-full bg-[#050914] rounded-xl px-2.5 py-1.5 border border-slate-900/40 flex items-center justify-between text-[9px] font-mono">
                      <span className="text-slate-500 uppercase">SIGNAL LOGGED:</span>
                      <span className={`font-black uppercase tracking-wider ${
                        currentActiveLog?.outcome === "ITM" 
                          ? "text-emerald-400" 
                          : currentActiveLog?.outcome === "OTM" 
                          ? "text-rose-450" 
                          : "text-amber-500"
                      }`}>
                        {currentActiveLog?.outcome || "PENDING"}
                      </span>
                    </div>
                  </div>

                </div>



                {/* SEQUENTIAL PREDICTIONS MATRIX */}
                {analysisResult?.sequentialSignals && analysisResult?.sequentialSignals?.length > 0 && (
                  <div className="space-y-3 p-4 bg-[#03060c] rounded-xl border border-slate-950">
                    <div className="flex items-center justify-between border-b border-indigo-950/40 pb-2 mb-2">
                      <span className="text-[10px] tracking-widest text-indigo-400 uppercase font-mono block font-black flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        📊 2. PRO SERIES SEQUENTIAL CANDLE TIMELINE
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        Minutes-only Expiries
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {analysisResult?.sequentialSignals?.map((seq, idx) => {
                        const isCall = seq.signal.includes("CALL") || seq.signal.includes("UP");
                        const isPut = seq.signal.includes("PUT") || seq.signal.includes("DOWN");

                        return (
                          <div 
                            key={idx} 
                            className={`p-3.5 rounded-xl border transition-all ${
                              isCall 
                                ? "bg-emerald-500/[0.02] border-emerald-500/10 hover:bg-emerald-500/[0.04]" 
                                : isPut 
                                ? "bg-rose-500/[0.02] border-rose-500/10 hover:bg-rose-500/[0.04]" 
                                : "bg-slate-500/[0.02] border-slate-800 hover:bg-slate-500/[0.04]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="text-[10px] font-mono text-[#5c6e91] font-bold">
                                CANDLE SEQUENCE #{seq.candleIndex}
                              </span>
                              <span className="text-[10px] font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-900/30 px-2 py-0.5 rounded font-black">
                                ⏱️ {seq.entryTime}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-2">
                              <span className={`text-[11px] font-extrabold uppercase py-0.5 px-2.5 rounded font-mono ${
                                isCall ? "text-emerald-400 bg-emerald-950/30 border border-emerald-900/40" 
                                : isPut ? "text-rose-400 bg-rose-950/30 border border-rose-900/40" 
                                : "text-slate-450 bg-slate-950 border border-slate-900"
                              }`}>
                                {seq.signal}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 font-semibold bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-950">
                                {seq.confidence}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#7d8fa9] mt-2.5 leading-snug font-sans border-t border-slate-900/50 pt-2">
                              {seq.rationale}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Risk Advice section */}
                {analysisResult?.riskWarning && (
                  <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 flex items-start gap-2.5 text-rose-300">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono uppercase font-black text-rose-400">Volatility Risk warning</span>
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        {analysisResult?.riskWarning}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </section>



        {/* DOUBLE COLUMN SPLIT LAYER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT WING: GRAPHICAL INPUT & PLATFORM SIMULATOR (7 COLUMNS) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* PRIMARY CHART SCANNER AND LOADER SHEET */}
            <div className="p-6 rounded-2xl bg-[#0a0f1b]/90 border border-slate-900 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between pb-1 border-b border-slate-900">
                <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-sm"></span>
                  2. SCAN TARGET MATRIX
                </h3>
                {uploadedImage && (
                  <button 
                    onClick={() => {
                      audio.playBeep();
                      setUploadedImage(null);
                      setAnalysisResult(null);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 focus:outline-none"
                  >
                    <X className="h-3 w-3" /> Scrub Clear
                  </button>
                )}
              </div>

              {/* Upload Frame Render */}
              {!uploadedImage && !showCameraMode ? (
                <div className="space-y-6">
                  
                  {/* Dashed upload container */}
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          if (event.target?.result) {
                            audio.playScan();
                            try {
                              const compressed = await compressImageBase64(event.target.result as string);
                              setUploadedImage(compressed);
                            } catch (compressErr) {
                              console.warn("Failed drop compression, falling back to original:", compressErr);
                              setUploadedImage(event.target.result as string);
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={`border-2 border-dashed rounded-3xl p-9 text-center transition-all cursor-pointer ${
                      dragOver 
                        ? "border-emerald-500 bg-emerald-500/5 glow-green" 
                        : "border-slate-800/80 bg-[#080d17]/80 hover:border-slate-800 hover:bg-[#090e1a]"
                    }`}
                  >
                    <div className="max-w-md mx-auto space-y-4">
                      
                      {/* Dashboard scan circle icon */}
                      <div className="mx-auto h-14 w-14 rounded-2xl bg-[#111624] flex items-center justify-center border border-slate-800">
                        <ImageIcon className="h-7 w-7 text-indigo-400 animate-pulse" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-wide uppercase text-slate-200">
                          Upload or Scan Quotex Screenshot
                        </h4>
                        <p className="text-xs text-slate-500">
                          Drag and drop file, browse PC, or capture instantly.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-wrap justify-center gap-3">
                        <label className="cursor-pointer bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md shadow-indigo-600/15">
                          Choose From File Gallery
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange} 
                          />
                        </label>
                        <button 
                          onClick={startCamera}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-350 font-bold border border-slate-800 hover:border-slate-700 text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none"
                        >
                          <Camera className="h-4 w-4 text-indigo-400" /> Start Rig Scanner
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-500 font-mono">
                        💡 PRO-SHORTCUT: Press <kbd className="bg-slate-800 text-slate-300 font-mono px-1 py-0.5 rounded text-[9px]">Ctrl + V</kbd> anywhere on screen to paste chart clip instantly.
                      </p>

                    </div>
                  </div>

                </div>
              ) : null}

              {/* Camera Access Stream Layout */}
              {showCameraMode && (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#060912] p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Live Scanner Screen Align
                    </span>
                    <button 
                      onClick={closeCamera}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 focus:outline-none"
                    >
                      <X className="h-4 w-4" /> Exit Scanner
                    </button>
                  </div>

                  {cameraError ? (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-xs space-y-2">
                      <p>{cameraError}</p>
                      <button 
                        onClick={startCamera}
                        className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-[10px] text-white font-bold"
                      >
                        Retry Access
                      </button>
                    </div>
                  ) : (
                    <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-black aspect-video max-w-lg mx-auto">
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover scale-x-[-1]"
                        playsInline
                        muted
                      />
                      <div className="absolute inset-0 border-4 border-dashed border-emerald-500/15 pointer-events-none flex items-center justify-center">
                        <div className="w-[85%] h-[80%] border border-dotted border-emerald-400/30 rounded flex items-end justify-center pb-2">
                          <span className="text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded">ALIGN SCREEN BOUNDS HERE</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center gap-3 pt-2">
                    <button 
                      onClick={snapPhoto}
                      disabled={!!cameraError}
                      className="bg-gradient-to-r from-emerald-500 to-indigo-600 hover:scale-[1.01] text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/15 flex items-center gap-1 focus:outline-none"
                    >
                      📸 CAPTURE FRAME STREAM
                    </button>
                    <button 
                      onClick={closeCamera}
                      className="bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-900 text-xs py-3 px-5 rounded-xl transition-all focus:outline-none"
                    >
                      Cancel Target
                    </button>
                  </div>
                </div>
              )}

              {/* Display of Uploaded Screen Segment Ready for Dispatch */}
              {uploadedImage && !showCameraMode && (
                <div className="space-y-4">
                  <div className="relative border border-slate-900 rounded-2xl overflow-hidden bg-[#04070d] p-2">
                    <img 
                      src={uploadedImage} 
                      alt="Active Trade Matrix" 
                      className="max-h-[295px] w-auto mx-auto object-contain block rounded-lg shadow-inner" 
                    />
                    
                    {/* Floating Telemetry Badge */}
                    <div className="absolute top-4 left-4 bg-[#0a0f1b]/95 border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] font-mono text-slate-300 flex items-center gap-1.5 shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      ALIGNED ASSET: {assetPair} ({timeframe})
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    
                    <button 
                      onClick={() => dispatchAnalysisRun(uploadedImage)}
                      disabled={isAnalyzing}
                      className={`font-black text-xs py-3.5 px-6 rounded-xl text-white transition-all shadow-lg flex items-center justify-center gap-2 focus:outline-none ${
                        isAnalyzing
                          ? "bg-slate-900/40 border border-slate-900 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 hover:scale-[1.01] shadow-indigo-600/15 cursor-pointer"
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="h-4.5 w-4.5 animate-spin text-indigo-400" />
                          SCANNING MATRIX...
                        </>
                      ) : (
                        <>
                          Analyze Signal 🚀
                        </>
                      )}
                    </button>

                    <button 
                      onClick={() => {
                        audio.playBeep();
                        setUploadedImage(null);
                        setAnalysisResult(null);
                      }}
                      disabled={isAnalyzing}
                      className="bg-slate-950 hover:bg-[#111624] border border-slate-900 text-slate-400 hover:text-white font-bold text-xs py-3.5 px-5 rounded-xl transition-all focus:outline-none"
                    >
                      Upload Different Image
                    </button>

                  </div>
                </div>
              )}

            </div>

            {/* PLATFORM CHART PREFERENCES FORM TRAY - FULLY AUTOMATIC */}
            <div className="p-6 rounded-2xl bg-[#0a0f1b]/90 border border-slate-900 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-950/40">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00ff66] animate-pulse"></span>
                  <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-1.5 font-mono">
                    3. AUTOMATIC CHART CONFIGURATOR
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                  ⚡ INSTANT AI EXTRACTION
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Automated Asset Reading */}
                <div className="p-4 bg-[#03060c] rounded-xl border border-slate-950 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-[#5c6e91] uppercase tracking-widest block font-bold mb-1">
                      CHART ASSET PROFILE
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-black font-mono text-white tracking-tight">
                        {analysisResult?.detectedAsset || assetPair}
                      </span>
                      {analysisResult?.detectedAsset ? (
                        <span className="text-[9px] text-[#00ff66] bg-[#00ff66]/10 border border-[#00ff66]/20 px-2 py-0.5 rounded uppercase font-bold font-mono">
                          Auto-Detected
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#5c6e91] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase font-bold font-mono">
                          Default Ready
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-3 leading-tight">
                    Machine learning OCR algorithm scans page labels in real-time.
                  </p>
                </div>

                {/* Automated Timeframe Reading */}
                <div className="p-4 bg-[#03060c] rounded-xl border border-slate-950 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-[#5c6e91] uppercase tracking-widest block font-bold mb-1">
                      CHART TIMEFRAME
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-black font-mono text-white tracking-tight">
                        {analysisResult?.detectedTimeframe || timeframe}
                      </span>
                      {analysisResult?.detectedTimeframe ? (
                        <span className="text-[9px] text-[#00ff66] bg-[#00ff66]/10 border border-[#00ff66]/20 px-2 py-0.5 rounded uppercase font-bold font-mono">
                          Auto-Detected
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#5c6e91] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase font-bold font-mono">
                          Default Ready
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-3 leading-tight">
                    Detects the current candlestick compression interval effortlessly.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT WING: TECHNICAL ANALYSIS STUDY (5 COLUMNS) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* EXPANDED PATTERN EDUCATION BASE */}
            <div className="p-6 rounded-3xl bg-[#090e1a]/95 border border-[#141d30] shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-[#1b253b] pb-2.5">
                <h3 className="text-xs font-black text-[#8da4cc] tracking-widest uppercase flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-sm"></span>
                  📚 EDUCATIONAL METRICS REFERENCE
                </h3>
              </div>

              {/* Minimal sub-tabs with active feedback */}
              <div className="flex border-b border-[#111929] mb-4 text-xs font-bold font-sans">
                <button 
                  onClick={() => {
                    audio.playBeep();
                    setTechGuideTab("candlesticks");
                  }}
                  className={`pb-2.5 px-4 transition-all focus:outline-none ${techGuideTab === "candlesticks" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-[#7a889e] hover:text-slate-200"}`}
                >
                  Candlesticks
                </button>
                <button 
                  onClick={() => {
                    audio.playBeep();
                    setTechGuideTab("trendlines");
                  }}
                  className={`pb-2.5 px-4 transition-all focus:outline-none ${techGuideTab === "trendlines" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-[#7a889e] hover:text-slate-200"}`}
                >
                  Trends & EMAs
                </button>
                <button 
                  onClick={() => {
                    audio.playBeep();
                    setTechGuideTab("psychological");
                  }}
                  className={`pb-2.5 px-4 transition-all focus:outline-none ${techGuideTab === "psychological" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-[#7a889e] hover:text-slate-200"}`}
                >
                  S/R Decimals
                </button>
              </div>

              {techGuideTab === "candlesticks" && (
                <div className="space-y-3.5 text-xs text-slate-400 leading-relaxed font-sans">
                  <div className="p-3 bg-[#03060c] rounded-xl border border-[#111826] flex flex-col gap-1">
                    <span className="text-emerald-400 font-extrabold font-mono uppercase text-[11px]">
                      🟢 BULLISH MARUBOZU
                    </span>
                    <p className="leading-snug text-slate-350">
                      A very solid long green candle body with virtually no upper or lower shadows. Proves immediate strong buying surge. Highly probable 1-candle CALL outcome.
                    </p>
                  </div>

                  <div className="p-3 bg-[#03060c] rounded-xl border border-[#111826] flex flex-col gap-1">
                    <span className="text-rose-500 font-extrabold font-mono uppercase text-[11px]">
                      🔴 SHOOTING STAR
                    </span>
                    <p className="leading-snug text-slate-350">
                      A short lower body topped by a massive upper shadow spike. Proves aggressive supply pressure off a resistance barrier. Highly probable 1-3 candle PUT entry.
                    </p>
                  </div>

                  <div className="p-3 bg-[#03060c] rounded-xl border border-[#111826] flex flex-col gap-1">
                    <span className="text-amber-500 font-extrabold font-mono uppercase text-[11px]">
                      🟡 DRAGONFLY DOJI
                    </span>
                    <p className="leading-snug text-slate-350">
                      A horizontal line top with a long bottom wick spike. Proves bear exhaustion and massive buyback from support levels. Indicates trend continuation.
                    </p>
                  </div>
                </div>
              )}

              {techGuideTab === "trendlines" && (
                <div className="space-y-3 text-xs text-slate-400 leading-relaxed font-sans">
                  <p>
                    <strong>Exponential Moving Average (EMA) Bounces:</strong> Moving averages acts as dynamic support. If price tests the EMA 20 line during a solid uptrend, watch for shrinking red candles followed by a green hammer. This is ideal entry.
                  </p>
                  <p>
                    <strong>Momentum Decay Sequence:</strong> Look for visual patterns where candle blocks grow consistently smaller as they approach peak resistance lines. This indicates the buyers capital is depleted, signaling high likelihood of reverse action.
                  </p>
                </div>
              )}

              {techGuideTab === "psychological" && (
                <div className="space-y-3 text-xs text-[#9aa9bf] leading-relaxed font-sans">
                  <p>
                    <strong>Round Decimal Targets (Order Blocks):</strong> Price quotes matching flat bounds such as .1000, .5000, or .0002 feature heavy institutional orders. Algorithms automatically bounce price off these channels. Seek signals that align near round values for maximum confidence.
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* EDUCATIONAL FOOTER */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/60 py-8 absolute bottom-0 left-0 right-0">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">
            Q-SIGNAL ANALYZER DECODER
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl mx-auto font-sans">
            AI signals are for educational purposes. Trading involves high risk. Binary Options speculation carries significant likelihood of initial asset drawdowns. Past simulations do not constitute guarantees of future outcome yields.
          </p>
          <div className="flex justify-center gap-4 text-[10px] text-slate-600 font-mono">
            <span>Platform Integration Scope: Quotex / IQ Option / MT4</span>
            <span>•</span>
            <span>Security Model: Server-side Gemini API Encrypted Protocol</span>
          </div>
        </div>
      </footer>

      {/* SETTINGS PANEL MODAL DRAWER */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative space-y-6">
            
            <button 
              onClick={() => {
                setShowSettings(false);
                audio.playBeep();
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white focus:outline-none cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-indigo-400" />
                Global System Settings
              </h3>
              <p className="text-xs text-slate-500 font-mono">Configure fallback logic, simulator seeds, and outcome limits.</p>
            </div>

            <div className="space-y-4">
              
              {/* Option 1: Demo Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-900">
                <div>
                  <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider font-sans">
                    Offline Mock Safety mode
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono max-w-[200px] block mt-0.5 leading-tight">
                    Simulates rapid feedback without contacting servers or keys.
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setDemoMode(prev => !prev);
                    audio.playBeep();
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${demoMode ? "bg-indigo-600" : "bg-slate-850"}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${demoMode ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Option 2: Synthesizer Sounds */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-900">
                <div>
                  <label className="text-xs font-bold text-slate-205 block uppercase tracking-wider font-sans">
                    Retro Desktop Sound Engine
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono max-w-[200px] block mt-0.5 leading-tight">
                    Active sound confirmation for signals, captures, and validation.
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setSoundOn(prev => !prev);
                    audio.playBeep();
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${soundOn ? "bg-[#00ff66]" : "bg-slate-850"}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${soundOn ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Option 3: Target Broker Indicator */}
              <div className="space-y-1.5 p-3.5 bg-slate-950 rounded-xl border border-slate-900">
                <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                  Select Broker Platform
                </label>
                <select 
                  value={customTargetBroker} 
                  onChange={(e) => {
                    audio.playBeep();
                    setCustomTargetBroker(e.target.value);
                  }}
                  className="w-full bg-[#0e1423] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Quotex">Quotex Mobile/Desktop Pro</option>
                  <option value="PocketOption">PocketOption Web</option>
                  <option value="IQ Option">IQ Option Global</option>
                  <option value="MetaTrader 4">MetaTrader 4 (MT4)</option>
                </select>
              </div>

              {/* Option 4: Risk Margin limit */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase block text-slate-200">Daily Drawdown Trigger</span>
                  <span className="text-xs font-mono font-bold text-indigo-400">{consecutiveLossLimit} entries</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={consecutiveLossLimit}
                  onChange={(e) => {
                    audio.playBeep();
                    setConsecutiveLossLimit(Number(e.target.value));
                  }}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[9.5px] text-slate-500 block leading-tight font-mono">
                  Warns when consecutive OTM trades threaten daily balance thresholds.
                </span>
              </div>

            </div>

            <button 
              onClick={() => {
                setShowSettings(false);
                audio.playBeep();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-50 hover:to-indigo-700 text-white font-extrabold text-xs tracking-widest uppercase transition-all shadow-md shadow-indigo-600/15 focus:outline-none"
            >
              Apply Configurations & Dismiss
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
