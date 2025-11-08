import { AspectRatio } from './types';

export const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      if (!base64Data) {
        reject(new Error("Could not extract base64 data from file."));
        return;
      }
      resolve({ data: base64Data, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const formatImageWithAspectRatio = (
  file: File,
  targetAspectRatio: AspectRatio
): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        const originalRatio = originalWidth / originalHeight;

        let targetRatioValue: number;
        switch (targetAspectRatio) {
          case AspectRatio.SQUARE:
            targetRatioValue = 1;
            break;
          case AspectRatio.PORTRAIT:
            targetRatioValue = 9 / 16;
            break;
          case AspectRatio.LANDSCAPE:
            targetRatioValue = 16 / 9;
            break;
          default:
            // Should not happen with typed inputs, but as a fallback:
            targetRatioValue = originalRatio; 
        }

        let canvasWidth: number;
        let canvasHeight: number;

        if (originalRatio > targetRatioValue) {
          // Original is wider than target (e.g., 16:9 vs 1:1). Use original width, calculate new height for letterboxing.
          canvasWidth = originalWidth;
          canvasHeight = originalWidth / targetRatioValue;
        } else {
          // Original is taller than target (e.g., 9:16 vs 1:1). Use original height, calculate new width for pillarboxing.
          canvasHeight = originalHeight;
          canvasWidth = originalHeight * targetRatioValue;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        // A white background is neutral and common for product shots.
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const x = (canvasWidth - originalWidth) / 2;
        const y = (canvasHeight - originalHeight) / 2;
        
        ctx.drawImage(img, x, y, originalWidth, originalHeight);

        // Using WebP for efficient compression, which the API supports.
        const mimeType = 'image/webp';
        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        const base64Data = dataUrl.split(',')[1];

        if (!base64Data) {
          return reject(new Error("Could not extract base64 data from formatted canvas."));
        }
        
        resolve({ data: base64Data, mimeType });
      };
      img.onerror = (error) => reject(error);
      img.src = e.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
  });
};
