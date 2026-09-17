"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { FormField, FormSection } from "@/frontend/admin/ui/FormField";
import { RichTextEditor } from "@/frontend/admin/editor/RichTextEditor";
import { ImageUpload } from "@/frontend/admin/media/ImageUpload";
import { Icons } from "@/frontend/admin/ui/Icons";
import { useToast } from "@/frontend/admin/ui/ToastProvider";

type PageFormProps = {
  action: (formData: FormData) => void;
  defaultValues?: {
    title?: string;
    slug?: string;
    content?: string;
    featuredImage?: string;
    showInMenu?: boolean;
    menuOrder?: number;
    publishedAt?: Date | null;
  };
  isEdit?: boolean;
};

// Slug oluşturma
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function PageForm({ action, defaultValues = {}, isEdit = false }: PageFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [content, setContent] = useState(defaultValues.content || "<p></p>");
  const [title, setTitle] = useState(defaultValues.title || "");
  const [slug, setSlug] = useState(defaultValues.slug || "");
  const [autoSlug, setAutoSlug] = useState(!defaultValues.slug);
  const [showInMenu, setShowInMenu] = useState(defaultValues.showInMenu !== false);
  const [isPublished, setIsPublished] = useState(!!defaultValues.publishedAt);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  // Otomatik slug
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(generateSlug(title));
    }
  }, [title, autoSlug]);

  // İlerleme
  const requiredFields = [!!title, content !== "<p></p>"];
  const progress = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("content", content);
    formData.set("slug", slug);
    try {
      await action(formData);
      success("Sayfa başarıyla kaydedildi.", "Değişiklikler sisteme işlendi.");
    } catch (err) {
      showError("Hata Oluştu", err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* İlerleme */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Formun Doluluk Oranı</span>
          <span className="text-sm font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Temel Bilgiler */}
      <FormSection title="📄 Sayfa Detayları">
        <FormField label="Sayfa Başlığı" required>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Örn: Gizlilik Politikası"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {title && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-600">
              <Icons.CheckCircle className="h-3 w-3" />
              <span>{title.length} karakter</span>
            </div>
          )}
        </FormField>

        <FormField label="Sitedeki Bağlantı (Sayfa Adresi)">
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            placeholder="gizlilik-politikasi"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {slug && (
            <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-700 mb-1">🔗 Sayfa Bağlantısı Önizleme:</p>
              <p className="text-xs font-mono text-gray-600 break-all">
                hayattan.net/sayfa/<span className="font-bold text-gray-900">{slug}</span>
              </p>
            </div>
          )}
        </FormField>

        <FormField label="Kapak Fotoğrafı" help="Sayfanın en üstünde gösterilecek ana resim">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <ImageUpload
              name="featuredImage"
              label=""
              help=""
              defaultValue={defaultValues.featuredImage}
            />
          </div>
        </FormField>

        <FormField label="Sayfa İçeriği" required>
          <div className="rounded-lg border-2 border-gray-200 bg-white p-1">
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Sayfa içeriğini buraya yazın..."
            />
          </div>
        </FormField>
      </FormSection>

      {/* Menü ve Yayın Ayarları */}
      <FormSection title="⚙️ Ayarlar">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Menüde Göster */}
          <label className={`group flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all ${showInMenu
            ? 'border-gray-400 bg-gray-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
            <input
              type="checkbox"
              name="showInMenu"
              checked={showInMenu}
              onChange={(e) => setShowInMenu(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <Icons.Menu className="h-4 w-4 text-gray-700" />
                <span className="font-semibold text-gray-900">Menüde Göster</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Site header menüsünde görünsün
              </p>
            </div>
          </label>

          {/* Yayında */}
          <label className={`group flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all ${isPublished
            ? 'border-gray-400 bg-gray-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
            <input
              type="checkbox"
              name="publishedAt"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <Icons.CheckCircle className="h-4 w-4 text-gray-700" />
                <span className="font-semibold text-gray-900">Sitede Göster (Aktif)</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Ziyaretçiler görebilsin
              </p>
            </div>
          </label>
        </div>

        {/* Menü Sırası */}
        {showInMenu && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <FormField label="Menü Sırası" help="Küçük numara önce görünür (örn: 1, 2, 3...)">
              <input
                type="number"
                name="menuOrder"
                defaultValue={defaultValues.menuOrder ?? 0}
                min={0}
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </FormField>
          </div>
        )}
      </FormSection>

      {/* Info */}
      {!isPublished && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex gap-3">
            <Icons.Info className="h-5 w-5 shrink-0 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <strong className="font-semibold text-gray-900">Taslak:</strong> Bu sayfa henüz yayında değil. "Yayında" seçeneğini işaretleyerek aktif hale getirebilirsiniz.
            </div>
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-8 py-3 text-base font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:opacity-50"
        >
          <Icons.CheckCircle className="h-5 w-5" />
          {isSubmitting ? "Kaydediliyor..." : (isEdit ? "Değişiklikleri Kaydet" : "Sayfayı Oluştur")}
        </button>
        <Link
          href="/admin/sayfalar"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}
