import { logger } from './logger';

/**
 * 画像を最適化する関数
 * 大きな画像をリサイズし、メモリ使用量とレンダリングパフォーマンスを改善
 * 
 * @param file 元の画像ファイル
 * @param maxWidth 最大幅（デフォルト: 1920px）
 * @param maxHeight 最大高さ（デフォルト: 1920px）
 * @param quality JPEG品質（0-1、デフォルト: 0.9）
 * @returns 最適化された画像ファイル
 */
export async function optimizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 既に指定サイズ以下の場合は最適化不要
        if (width <= maxWidth && height <= maxHeight) {
          logger.log('Image already optimized, skipping resize');
          resolve(file);
          return;
        }

        // アスペクト比を保ちながらリサイズ
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        logger.log(`Resizing image from ${img.width}x${img.height} to ${width}x${height}`);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // 高品質なリサンプリング
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);
        
        // Blobに変換
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            const optimizedFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            });
            
            logger.log(`Image optimized: ${file.size} bytes -> ${optimizedFile.size} bytes`);
            resolve(optimizedFile);
          },
          file.type || 'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 画像ファイルのサイズをチェックし、必要に応じて最適化
 * 
 * @param file 画像ファイル
 * @param maxSizeMB 最大サイズ（MB、デフォルト: 5MB）
 * @returns 最適化された画像ファイル、または元のファイル
 */
export async function optimizeImageIfNeeded(
  file: File,
  maxSizeMB: number = 5
): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // サイズが小さい場合は最適化不要
  if (file.size <= maxSizeBytes) {
    return file;
  }

  // サイズに応じて最大サイズを調整
  // 5MB以上なら1920px、10MB以上なら1080px
  let maxDimension = 1920;
  if (file.size > 10 * 1024 * 1024) {
    maxDimension = 1080;
  }

  return optimizeImage(file, maxDimension, maxDimension, 0.85);
}

