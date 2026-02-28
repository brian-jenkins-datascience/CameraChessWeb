import Tesseract from 'tesseract.js';

let worker: Tesseract.Worker | null = null;
let workerReady = false;
let workerInitializing = false;

const initWorker = async () => {
  if (workerInitializing || workerReady) return;
  workerInitializing = true;
  try {
    worker = await Tesseract.createWorker('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789',
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
    });
    workerReady = true;
  } catch (e) {
    console.error("Failed to initialize Tesseract worker:", e);
    workerInitializing = false;
  }
};

// Initialize worker eagerly
initWorker();

/**
 * Crop a region from the video, convert to grayscale, and run OCR.
 * Returns the clock time as "HH:MM:SS" or null if OCR fails.
 * 
 * The bounding box is defined by two points (top-left, bottom-right)
 * in the same coordinate system as the video element's natural dimensions.
 */
export const readClockFromVideo = async (
  videoRef: any,
  topLeft: number[],
  bottomRight: number[]
): Promise<string | null> => {
  if (!workerReady || !worker) {
    await initWorker();
    if (!workerReady || !worker) return null;
  }

  const video = videoRef.current;
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;

  // Create an offscreen canvas for cropping
  const cropCanvas = document.createElement('canvas');
  const ctx = cropCanvas.getContext('2d');
  if (!ctx) return null;

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  // Convert from model coordinates to video pixel coordinates
  const sx = videoWidth / 480;  // MODEL_WIDTH
  const sy = videoHeight / 288; // MODEL_HEIGHT

  const x = Math.max(0, Math.round(topLeft[0] * sx));
  const y = Math.max(0, Math.round(topLeft[1] * sy));
  const w = Math.max(1, Math.round((bottomRight[0] - topLeft[0]) * sx));
  const h = Math.max(1, Math.round((bottomRight[1] - topLeft[1]) * sy));

  cropCanvas.width = w;
  cropCanvas.height = h;

  // Draw the cropped region from the video
  ctx.drawImage(video, x, y, w, h, 0, 0, w, h);

  // Convert to grayscale for better OCR performance
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  ctx.putImageData(imageData, 0, 0);

  try {
    const { data: result } = await worker.recognize(cropCanvas);
    const digits = result.text.replace(/\D/g, '');
    return formatClockDigits(digits);
  } catch (e) {
    console.error("OCR error:", e);
    return null;
  }
};

/**
 * Format raw digit string as "HH:MM:SS".
 * Treats input as MMSS (e.g., "2028" -> "00:20:28").
 * Handles edge cases for various digit counts.
 */
const formatClockDigits = (digits: string): string | null => {
  if (digits.length === 0) return null;

  // Pad to at least 4 digits (MMSS)
  const padded = digits.padStart(4, '0');

  if (padded.length <= 4) {
    // Treat as MMSS
    const mm = padded.slice(0, 2);
    const ss = padded.slice(2, 4);
    return `00:${mm}:${ss}`;
  } else if (padded.length <= 6) {
    // Treat as HMMSS or HHMMSS
    const normalized = padded.padStart(6, '0');
    const hh = normalized.slice(0, 2);
    const mm = normalized.slice(2, 4);
    const ss = normalized.slice(4, 6);
    return `${hh}:${mm}:${ss}`;
  }

  // Too many digits — take last 6
  const trimmed = padded.slice(-6);
  const hh = trimmed.slice(0, 2);
  const mm = trimmed.slice(2, 4);
  const ss = trimmed.slice(4, 6);
  return `${hh}:${mm}:${ss}`;
};

export const terminateWorker = async () => {
  if (worker) {
    await worker.terminate();
    worker = null;
    workerReady = false;
    workerInitializing = false;
  }
};
