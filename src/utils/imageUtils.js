import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload.
 * @param {File} file - The original image file.
 * @returns {Promise<File>} - The compressed file.
 */
export async function compressImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    return file; // Fallback to original
  }
}
