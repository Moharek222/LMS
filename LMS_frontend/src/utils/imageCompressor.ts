/**
 * Compresses an image file in the browser using HTML5 Canvas
 * Resizes the image to fit within maxWidth/maxHeight and encodes it as JPEG/WebP with specified quality.
 * Reduces raw 3-5MB image files to ~20-50KB base64 strings.
 */
export const compressImageFile = (
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.65
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('الملف المحدد ليس صورة صالحة'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(event.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress as image/jpeg
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error('فشل تحميل الصورة'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
    reader.readAsDataURL(file);
  });
};
