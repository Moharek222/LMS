import apiClient from '../../../services/apiClient';

export interface GenerateUploadUrlResponse {
  message: string;
  data: {
    uploadUrl: string;
    fileKey: string;
  };
}

export const generateUploadUrl = async (contentType: string): Promise<GenerateUploadUrlResponse['data']> => {
  const response = await apiClient.post<GenerateUploadUrlResponse>(
    '/api/lessons/generate-upload-url',
    { contentType }
  );
  return response.data.data;
};

export const uploadVideoFileToPresignedUrl = (
  uploadUrl: string,
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Video upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during video upload'));
    };

    xhr.send(file);
  });
};

export default {
  generateUploadUrl,
  uploadVideoFileToPresignedUrl,
};
