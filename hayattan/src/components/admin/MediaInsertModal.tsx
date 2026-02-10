"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Modal } from "@/components/admin/Modal";
import { Icons } from "@/components/admin/Icons";

const MAX_MEDIA_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPT = {
  "video/*": [".mp4", ".webm", ".ogg", ".mov"],
  "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".webm"],
  "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
};

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be)(?:\/.*)?$/;

type MediaType = "video" | "audio" | "image";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function isYouTubeUrl(url: string) {
  return YOUTUBE_REGEX.test(url.trim());
}

type MediaInsertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (type: MediaType, src: string, alt?: string) => void;
};

export function MediaInsertModal({
  isOpen,
  onClose,
  onInsert,
}: MediaInsertModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; type: string } | null>(null);

  // URL State
  const [urlInput, setUrlInput] = useState("");

  // General
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUrlInput("");
    setError(null);
    setUploadedFile(null);
    setUploading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setActiveTab("upload");
    }
  }, [isOpen, reset]);

  // --- Actions ---

  const handleUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const { uploadFiles } = await import("uploadthing/client");
      const res = await uploadFiles("articleImage", { files: [file] });
      const { url } = res[0];

      if (!url) {
        throw new Error("Yükleme başarılı ancak URL alınamadı.");
      }

      // Determine type based on mime type or extension
      const mime = file.type;
      let type = "video";
      if (mime.startsWith("image/")) type = "image";
      else if (mime.startsWith("audio/")) type = "audio";

      setUploadedFile({
        url: url,
        name: file.name,
        type: type
      });

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Dosya yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((accepted: File[]) => {
    handleUpload(accepted);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: MAX_MEDIA_SIZE,
    disabled: uploading || !!uploadedFile,
    multiple: false // Only one file at a time for direct insert
  });

  const handleInsert = () => {
    if (activeTab === "upload" && uploadedFile) {
      let type: MediaType = "video";
      if (uploadedFile.type === "audio") type = "audio";
      if (uploadedFile.type === "image") type = "image";

      onInsert(type, uploadedFile.url, uploadedFile.name);
      onClose();
    } else if (activeTab === "url" && urlInput) {
      if (isYouTubeUrl(urlInput)) {
        onInsert("video", urlInput);
      } else {
        const type = urlInput.match(/\.(mp3|wav|ogg)$/i) ? "audio" : "video";
        onInsert(type, urlInput);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medya Ekle" size="lg">
      <div className="flex h-[500px] overflow-hidden rounded-lg border border-gray-100 bg-white">

        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col pt-4">
          <div className="px-3 pb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Medya</h3>
            <div className="space-y-1">
              <SidebarButton
                active={activeTab === "upload"}
                icon={Icons.Upload}
                label="Dosya Yükle"
                onClick={() => setActiveTab("upload")}
              />
              <SidebarButton
                active={activeTab === "url"}
                icon={Icons.Link}
                label="URL Bağlantısı"
                onClick={() => setActiveTab("url")}
              />
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-400 text-center">
              Hayattan CMS
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">

          {/* Content Area */}
          <div className="flex-1 p-6 flex flex-col overflow-y-auto">

            {/* UPLOAD VIEW */}
            {activeTab === "upload" && (
              <div className="flex-1 flex flex-col">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Dosya Yükle</h2>
                  <p className="text-sm text-gray-500">Bilgisayarınızdan bir medya dosyası seçin.</p>
                </div>

                {!uploadedFile ? (
                  <div {...getRootProps()} className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                    <input {...getInputProps()} />
                    {uploading ? (
                      <div className="text-center">
                        <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                        <h4 className="text-gray-900 font-medium">Yükleniyor...</h4>
                        <p className="text-sm text-gray-500 mt-1">Lütfen bekleyin.</p>
                      </div>
                    ) : (
                      <>
                        <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                          <Icons.Upload className="h-7 w-7" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Dosyayı buraya bırakın</h4>
                        <span className="text-sm text-gray-500 mb-4">veya seçmek için tıklayın</span>
                        <div className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">
                          Max 100MB (Video, Ses, Resim)
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-6 text-center">
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <Icons.Check className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Yükleme Tamamlandı!</h3>
                    <p className="text-sm text-gray-600 mt-1 font-medium bg-white px-3 py-1 rounded border border-gray-200 inline-block max-w-xs truncate">
                      {uploadedFile.name}
                    </p>
                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Başkasıyla Değiştir
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <Icons.AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}


            {/* URL VIEW */}
            {activeTab === "url" && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center max-w-md mx-auto w-full">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Icons.Link className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Bağlantı Ekle</h3>
                  <p className="text-gray-500 mb-8 text-sm">YouTube veya harici medya bağlantısını yapıştırın.</p>

                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (urlInput.trim()) handleInsert();
                        }
                      }}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
                      autoFocus
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Icons.Link className="h-5 w-5" />
                    </div>
                  </div>

                  {urlInput && (
                    <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1">
                      <Icons.CheckCircle className="h-3 w-3 text-green-500" />
                      Bağlantı geçerli görünüyor (otomatik algılanacak)
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Footer Action Area - type="button" ile form submit tetiklenmez */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all shadow-sm"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={
                (activeTab === "upload" && !uploadedFile) ||
                (activeTab === "url" && !urlInput)
              }
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            >
              {activeTab === "upload" ? "Dosyayı Ekle" : "Bağlantıyı Ekle"}
            </button>
          </div>

        </div>
      </div>
    </Modal>
  );
}

// Sub-components
function SidebarButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: any; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "bg-white text-blue-600 shadow-sm border border-gray-100" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
    >
      <Icon className={`h-4 w-4 ${active ? "text-blue-600" : "text-gray-400"}`} />
      {label}
    </button>
  )
}
