"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

type ImageUploadProps = {
  name: string;
  defaultValue?: string | null;
  label?: string;
  help?: string;
  className?: string;
  onChange?: (url: string) => void;
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Görsel alanı: dosya yükle (sürükle-bırak veya seç) veya URL yapıştır.
 * Local: public/uploads. Vercel: Blob (BLOB_READ_WRITE_TOKEN ile, ücretsiz kota).
 */
export function ImageUpload({
  name,
  defaultValue = null,
  label = "Fotoğraf",
  help = "Görseli sürükleyip bırakın, dosya seçin veya aşağıya URL yapıştırın. Maks. 10MB.",
  className,
  onChange,
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    defaultValue && defaultValue.trim() ? defaultValue.trim() : null
  );
  const [inputValue, setInputValue] = useState<string>(defaultValue ?? "");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // defaultValue değiştiğinde state'i güncelle
  useEffect(() => {
    if (defaultValue !== undefined) {
      const trimmedValue = defaultValue && defaultValue.trim() ? defaultValue.trim() : null;
      setImageUrl(trimmedValue);
      setInputValue(defaultValue ?? "");
      setImageError(false);
      setIsImageLoading(false);
    }
  }, [defaultValue]);

  // Component unmount olduğunda upload'ı iptal et
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const doUpload = useCallback(async (file: File) => {
    // Önceki upload'ı iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setImageError(false);

    // Yeni abort controller oluştur
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Simüle edilmiş progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 200);

      // Kendi R2 upload API'mizi kullan
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/r2/upload", {
        method: "POST",
        body: formData,
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Yükleme başarısız");
      }

      const data = await res.json();
      const url = data.url;

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!url) {
        throw new Error("Yükleme başarılı ancak URL alınamadı.");
      }

      // Kısa bir gecikme ile state'i güncelle (kullanıcıya progress görmesi için)
      await new Promise((resolve) => setTimeout(resolve, 100));

      setImageUrl(url);
      setInputValue(url);
      setImageError(false);
      setIsImageLoading(true);
      onChange?.(url);
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }
      console.error("Upload error:", err);
      const errorMessage = err.message || "Yükleme başarısız";
      setError(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, [onChange]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      // Dosya tipi kontrolü
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
        setError("Sadece resim dosyaları kabul edilir (JPEG, PNG, GIF, WebP).");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError(`Dosya ${(MAX_SIZE / 1024 / 1024).toFixed(0)} MB'dan küçük olmalı.`);
        return;
      }

      doUpload(file);
    },
    [doUpload]
  );

  const onDropRejected = useCallback((fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors.some((e: any) => e.code === "file-too-large")) {
        setError(`Dosya ${(MAX_SIZE / 1024 / 1024).toFixed(0)} MB'dan küçük olmalı.`);
      } else if (rejection.errors.some((e: any) => e.code === "file-invalid-type")) {
        setError("Sadece resim dosyaları kabul edilir (JPEG, PNG, GIF, WebP).");
      } else {
        setError("Dosya kabul edilmedi. Lütfen geçerli bir resim dosyası seçin.");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled: isUploading,
  });

  const validateUrl = useCallback((url: string): boolean => {
    if (!url || !url.trim()) return false;
    const trimmed = url.trim();
    // Yerel yol kontrolü
    if (trimmed.startsWith("/")) return true;
    // HTTP/HTTPS URL kontrolü
    try {
      const urlObj = new URL(trimmed);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);

    const trimmed = value.trim();
    if (!trimmed) {
      setImageUrl(null);
      setImageError(false);
      onChange?.("");
      return;
    }

    if (validateUrl(trimmed)) {
      setImageUrl(trimmed);
      setImageError(false);
      setIsImageLoading(true);
      onChange?.(trimmed);
    } else {
      // Geçersiz URL ama kullanıcı yazmaya devam edebilir
      setImageUrl(null);
      setImageError(false);
    }
  };

  const handleUrlBlur = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !validateUrl(trimmed)) {
      setError("Geçersiz URL formatı. Tam link (https://...) veya sitedeki yol (/uploads/...) girin.");
      setImageUrl(null);
      onChange?.("");
    }
  };

  const handleRemove = () => {
    // Upload devam ediyorsa iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setImageUrl(null);
    setInputValue("");
    setError(null);
    setImageError(false);
    setIsImageLoading(false);
    onChange?.("");
  };

  const handleImageLoad = () => {
    setImageError(false);
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    if (process.env.NODE_ENV === "development") {
      console.error("Image failed to load:", imageUrl);
    }
    setImageError(true);
    setIsImageLoading(false);
    // URL geçersizse input'u temizle
    if (imageUrl && !imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
      setError("Görsel yüklenemedi. Lütfen geçerli bir URL girin.");
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {help && <p className="mt-0.5 text-xs text-muted">{help}</p>}

      <input type="hidden" name={name} value={imageUrl && imageUrl.trim() ? imageUrl.trim() : ""} />

      <div className="mt-3 space-y-4">
        {/* Önizleme */}
        {imageUrl && imageUrl.trim() && (
          <div className="relative">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-[#e5e5dc] bg-muted-bg">
              {isImageLoading && !imageError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted-bg/80">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-xs text-muted">Yükleniyor...</p>
                  </div>
                </div>
              )}
              {imageError ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-red-500 text-sm p-4 text-center">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>Görsel yüklenemedi.</p>
                  <p className="text-xs">Lütfen URL'yi kontrol edin veya başka bir görsel deneyin.</p>
                </div>
              ) : imageUrl.startsWith("/") ? (
                // Yerel görseller için normal img tag kullan
                <img
                  src={imageUrl}
                  alt="Önizleme"
                  className="h-full w-full object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />
              ) : imageUrl.startsWith("http") ? (
                // Harici görseller için Next.js Image component kullan
                <Image
                  src={imageUrl}
                  alt="Önizleme"
                  fill
                  className="object-cover"
                  unoptimized={true}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-red-500 text-sm p-4 text-center">
                  Geçersiz görsel adresi. Lütfen başında / veya http(s) olduğundan emin olun.
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="absolute right-2 top-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 z-10"
            >
              Kaldır
            </button>
          </div>
        )}

        {/* Sürükle-bırak / dosya seç */}
        {(!imageUrl || !imageUrl.trim()) && (
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragActive
              ? "border-primary bg-primary-light"
              : "border-[#ddd] hover:border-primary hover:bg-[#f9f9f6]"
              } ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto flex flex-col items-center">
              <svg
                className="mb-3 h-12 w-12 text-muted"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {isUploading ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Yükleniyor... {uploadProgress}%
                  </p>
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-[#e5e5dc]">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                      }
                    }}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
                  >
                    İptal
                  </button>
                </div>
              ) : isDragActive ? (
                <p className="text-sm font-medium text-primary">
                  Dosyayı buraya bırakın...
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    Görseli sürükleyip bırakın veya tıklayarak seçin
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    PNG, JPG, GIF, WebP (maks. 4MB)
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* URL veya site içi yol */}
        <div>
          <label className="mb-1 block text-xs text-muted">
            Veya adres girin (dosya yüklediyseniz otomatik dolar):
          </label>
          <input
            type="text"
            placeholder="https://... veya /uploads/foto.jpg"
            value={inputValue}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            disabled={isUploading}
            className="w-full rounded-lg border border-[#ddd] px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Görsel adresi veya URL"
          />
          <p className="mt-1 text-xs text-muted">
            Tam link (https://...) veya sitedeki yol (/uploads/...) yazabilirsiniz.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
