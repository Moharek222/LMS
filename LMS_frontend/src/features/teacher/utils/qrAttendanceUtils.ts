import { Html5Qrcode } from 'html5-qrcode';

export const playAttendanceBeep = (soundEnabled: boolean): void => {
  if (!soundEnabled) return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    // Ignore audio errors
  }
};

export const extractStudentIdFromQr = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const hexMatch = trimmed.match(/[0-9a-fA-F]{24}/);
  if (hexMatch) {
    return hexMatch[0];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      const val = parsed.studentId || parsed.studentID || parsed.id || parsed._id;
      if (val && typeof val === 'string') {
        return val.trim();
      }
    }
  } catch {
    // Ignore JSON error
  }
  return trimmed;
};

export const isValidMongoId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

export const decodeQrFromImageFile = async (file: File): Promise<string | null> => {
  const tempId = 'temp-qr-file-reader-box';
  let tempEl = document.getElementById(tempId);
  if (!tempEl) {
    tempEl = document.createElement('div');
    tempEl.id = tempId;
    tempEl.style.display = 'none';
    document.body.appendChild(tempEl);
  }

  const html5Qrcode = new Html5Qrcode(tempId);
  let decodedText: string | null = null;

  try {
    decodedText = await html5Qrcode.scanFile(file, false);
  } catch {
    // Direct scan failed (e.g. image contains surrounding card borders or text)
  }

  if (!decodedText) {
    try {
      const croppedBlob = await new Promise<Blob | null>((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            return resolve(null);
          }

          const minDim = Math.min(img.width, img.height);
          const cropSize = Math.floor(minDim * 0.78);
          const cropX = Math.floor((img.width - cropSize) / 2);
          const cropY = Math.floor((img.height - cropSize) / 2);

          canvas.width = cropSize;
          canvas.height = cropSize;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, cropSize, cropSize);
          ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);

          URL.revokeObjectURL(url);
          canvas.toBlob((blob) => resolve(blob), 'image/png');
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });

      if (croppedBlob) {
        const croppedFile = new File([croppedBlob], 'qr_cropped.png', { type: 'image/png' });
        decodedText = await html5Qrcode.scanFile(croppedFile, false);
      }
    } catch {
      // Cropped scan failed
    }
  }

  html5Qrcode.clear();
  return decodedText;
};

