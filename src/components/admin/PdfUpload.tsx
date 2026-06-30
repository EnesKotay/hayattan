"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";

type PdfUploadProps = {
  name: string;
  defaultValue?: string | null;
  onChange?: (url: string) => void;
};

const MAX_SIZE_MB = 50;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

export function PdfUpload({ name, defaultValue = null, onChange }: PdfUploadProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(
    defaultValue && defaultValue.trim() ? defaultValue.trim() : null
  );
  const [inputValue, setInputValue] = useState<string>(defaultValue ?? "");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const doUpload = useCallback(async (file: File) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const presignRes = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: "application/pdf",
          size: file.size,
        }),
        signal: abortController.signal,
      });

      if (!presignRes.ok) {
        const errData = await presignRes.json().catch(() => ({}));
        throw new Error(errData.error || "Yükleme hazırlanamadı");
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      setUploadProgress(30);

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
        signal: abortController.signal,
      });

      if (!uploadRes.ok) {
        throw new Error("PDF yüklenemedi.");
      }

      setUploadProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 100));

      setPdfUrl(publicUrl);
      setInputValue(publicUrl);
      onChange?.(publicUrl);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Yükleme başarısız");
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
      if (file.size > MAX_SIZE) {
        setError(`Dosya ${MAX_SIZE_MB} MB'dan küçük olmalı.`);
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
        setError(`Dosya ${MAX_SIZE_MB} MB'dan küçük olmalı.`);
      } else if (rejection.errors.some((e: any) => e.code === "file-invalid-type")) {
        setError("Sadece PDF dosyaları kabul edilir.");
      } else {
        setError("Dosya kabul edilmedi. Lütfen geçerli bir PDF seçin.");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled: isUploading,
  });

  const handleRemove = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setPdfUrl(null);
    setInputValue("");
    setError(null);
    onChange?.("");
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);
    const trimmed = value.trim();
    if (!trimmed) {
      setPdfUrl(null);
      onChange?.("");
      return;
    }
    setPdfUrl(trimmed);
    onChange?.(trimmed);
  };

  const fileName = pdfUrl ? pdfUrl.split("/").pop() : null;

  return (
    <div>
      <input type="hidden" name={name} value={pdfUrl && pdfUrl.trim() ? pdfUrl.trim() : ""} />

      <div className="space-y-4">
        {pdfUrl && pdfUrl.trim() ? (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <svg className="h-8 w-8 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                PDF'i görüntüle →
              </a>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Kaldır
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive
                ? "border-primary bg-primary-light"
                : "border-[#ddd] hover:border-primary hover:bg-[#f9f9f6]"
            } ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto flex flex-col items-center">
              <svg className="mb-3 h-12 w-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {isUploading ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Yükleniyor... {uploadProgress}%</p>
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-[#e5e5dc]">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      abortControllerRef.current?.abort();
                    }}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
                  >
                    İptal
                  </button>
                </div>
              ) : isDragActive ? (
                <p className="text-sm font-medium text-primary">PDF'i buraya bırakın...</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    PDF sürükleyip bırakın veya tıklayarak seçin
                  </p>
                  <p className="mt-2 text-xs text-muted">PDF (maks. {MAX_SIZE_MB}MB)</p>
                </>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-muted">
            Veya PDF adresi girin (dosya yüklediyseniz otomatik dolar):
          </label>
          <input
            type="text"
            placeholder="https://... veya /uploads/dergi.pdf"
            value={inputValue}
            onChange={handleUrlChange}
            disabled={isUploading}
            className="w-full rounded-lg border border-[#ddd] px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
