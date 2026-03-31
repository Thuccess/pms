import { API_BASE_URL, authTokenStorage } from "@/lib/api/client";

export type UploadProgressCallback = (progress: number) => void;

export function uploadImageFile(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<{ url: string; filename: string }> {
  return new Promise((resolve, reject) => {
    if (!authTokenStorage.get()) {
      reject(new Error("Your session expired. Please log in again."));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/upload/image`);

    const token = authTokenStorage.get();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(json);
          return;
        }
        if (xhr.status === 401) {
          authTokenStorage.clear();
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
          reject(new Error("Session expired. Please log in and try again."));
          return;
        }
        reject(new Error(json.message || `Upload failed (${xhr.status})`));
      } catch {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    const formData = new FormData();
    formData.append("image", file);
    xhr.send(formData);
  });
}
