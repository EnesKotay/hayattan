"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastProvider";
import { FormField, FormSection } from "@/components/admin/FormField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { YayimlaSection } from "@/components/admin/YayimlaSection";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { OnizleModal } from "@/components/admin/OnizleModal";

type YaziFormProps = {
    action: (formData: FormData) => void;
    yazar?: { id: string; name: string }[];
    kategoriler?: { id: string; name: string; slug?: string }[];
    defaultValues?: {
        id?: string;
        title?: string;
        slug?: string;
        excerpt?: string;
        content?: string;
        featuredImage?: string;
        showInSlider?: boolean;
        authorId?: string;
        kategoriIds?: string[];
        publishedAt?: Date | null;
        metaDescription?: string;
        metaKeywords?: string;
        ogImage?: string;
        imageAlt?: string;
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

export function YaziForm({
    action,
    yazar = [],
    kategoriler = [],
    defaultValues = {},
    isEdit = false,
}: YaziFormProps) {
    const [content, setContent] = useState(defaultValues.content || "<p></p>");
    const [showOnizle, setShowOnizle] = useState(false);
    const [title, setTitle] = useState(defaultValues.title || "");
    const [slug, setSlug] = useState(defaultValues.slug || "");
    const [autoSlug, setAutoSlug] = useState(!defaultValues.slug);
    const [excerpt, setExcerpt] = useState(defaultValues.excerpt || "");
    const [metaDesc, setMetaDesc] = useState(defaultValues.metaDescription || "");
    const [featuredImage, setFeaturedImage] = useState(defaultValues.featuredImage || "");

    const [onizleData, setOnizleData] = useState<{
        title: string;
        excerpt: string;
        content: string;
        featuredImage: string;
        authorName: string;
        kategoriNames: string[];
    } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Otomatik slug
    useEffect(() => {
        if (autoSlug && title) {
            setSlug(generateSlug(title));
        }
    }, [title, autoSlug]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { success, error: showError } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        formData.set("content", content);
        formData.set("slug", slug);
        if (featuredImage) {
            formData.set("featuredImage", featuredImage);
        }

        try {
            await action(formData);
            success("Yazı başarıyla kaydedildi.", "Değişiklikler sisteme işlendi.");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Kaydedilirken bir hata oluştu.";
            showError("Hata Oluştu", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleOnizle = () => {
        const form = formRef.current;
        if (!form) return;
        const authorId = form.querySelector<HTMLSelectElement>('[name="authorId"]')?.value ?? "";
        const authorName = yazar.find((y) => y.id === authorId)?.name ?? "";
        const kategoriIds = form.querySelectorAll<HTMLInputElement>('input[name="kategoriIds"]:checked');
        const kategoriNames = Array.from(kategoriIds)
            .map((cb) => kategoriler.find((k) => k.id === cb.value)?.name)
            .filter(Boolean) as string[];
        setOnizleData({
            title: title || "(Başlık yok)",
            excerpt,
            content,
            featuredImage: featuredImage || "",
            authorName,
            kategoriNames,
        });
        setShowOnizle(true);
    };

    return (
        <>
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                    // URL veya metin alanında Enter'a basınca form gönderilmesin (sayfadan atılmasın)
                    if (e.key !== "Enter") return;
                    const el = e.target as HTMLElement;
                    if (el.tagName === "INPUT") {
                        const input = el as HTMLInputElement;
                        if (input.type !== "checkbox" && input.type !== "radio") {
                            e.preventDefault();
                        }
                    }
                }}
                className="space-y-6 pb-24"
            >

                {/* Temel Bilgiler */}
                <FormSection title="📝 Temel Bilgiler">
                    <FormField label="Yazı Başlığı" required>
                        <input
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Örn: Türkiye'nin Ekonomik Geleceği"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </FormField>

                    <FormField label="Sitenizdeki Bağlantı (Sayfa Adresi)" help="Yazının linki burada yazdığınız gibi görünecektir">
                        <input
                            name="slug"
                            value={slug}
                            onChange={(e) => {
                                setSlug(e.target.value);
                                setAutoSlug(false);
                            }}
                            placeholder="turkiye-nin-ekonomik-gelecegi"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </FormField>

                    <FormField
                        label="Yazı Özeti (Kısa Tanıtım)"
                        help="Yazı listelerinde ve sosyal medyada gösterilecek kısa yazı."
                    >
                        <textarea
                            name="excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            rows={3}
                            placeholder="Yazının kısa bir özetini buraya yazın veya AI'dan yardım alın..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </FormField>
                </FormSection>

                {/* Görsel */}
                <FormSection title="🖼️ Kapak Fotoğrafı">
                    <ImageUpload
                        name="featuredImage"
                        label="Kapak Resmi"
                        help="Yazının en üstünde ve listelerde görünecek ana fotoğraf"
                        defaultValue={defaultValues.featuredImage}
                        onChange={(url) => setFeaturedImage(url)}
                    />

                    <div className="mt-4">
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors">
                            <input
                                type="checkbox"
                                name="showInSlider"
                                value="on"
                                defaultChecked={defaultValues.showInSlider}
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <div>
                                <span className="text-sm font-semibold text-gray-900">
                                    Ana Sayfada Slider'da Göster
                                </span>
                                <p className="mt-0.5 text-xs text-gray-600">
                                    Bu yazı ana sayfada öne çıkarılır
                                </p>
                            </div>
                        </label>
                    </div>
                </FormSection>

                {/* Yazı İçeriği */}
                <FormSection title="✍️ Yazı İçeriği">
                    <FormField label="Metin" required>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Yazınızı buraya yazın..."
                        />
                    </FormField>
                </FormSection>

                {/* Yazar ve Kategoriler */}
                <FormSection title="👤 Yazar & Kategoriler">
                    <FormField label="Yazar" required>
                        <select
                            name="authorId"
                            required
                            defaultValue={defaultValues.authorId}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">— Yazar seçin —</option>
                            {yazar.map((y) => (
                                <option key={y.id} value={y.id}>
                                    {y.name}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label="Kategoriler" help="Birden fazla seçebilirsiniz">
                        <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
                            {kategoriler.length === 0 ? (
                                <p className="col-span-full text-sm text-gray-500">
                                    Kategori yok. <Link href="/admin/kategoriler/yeni" className="text-primary hover:underline">Ekle</Link>
                                </p>
                            ) : (
                                kategoriler.map((k) => (
                                    <label key={k.id} className="flex cursor-pointer items-center gap-2 hover:text-primary transition-colors">
                                        <input
                                            type="checkbox"
                                            name="kategoriIds"
                                            value={k.id}
                                            defaultChecked={defaultValues.kategoriIds?.includes(k.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                        <span className="text-sm font-medium">{k.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </FormField>
                </FormSection>

                {/* SEO */}
                <FormSection title="🔍 Google ve Paylaşım Ayarları">
                    <FormField
                        label="Google Arama Sonucu Özeti"
                        help="Google sonuçlarında başlığın altında çıkan açıklama yazısı."
                    >
                        <textarea
                            name="metaDescription"
                            value={metaDesc}
                            onChange={(e) => setMetaDesc(e.target.value)}
                            rows={2}
                            maxLength={160}
                            placeholder="Google'da en iyi görünecek açıklamayı yazın..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </FormField>
                </FormSection>

                {/* Yayımlama */}
                <YayimlaSection defaultValue={defaultValues.publishedAt} />

                {/* Sticky Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-lg lg:pl-64 z-40">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                        <Link
                            href="/admin/yazilar"
                            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            İptal
                        </Link>

                        <div className="flex items-center gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={handleOnizle}
                                className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-white px-4 py-2.5 font-semibold text-primary transition-all hover:bg-primary/5"
                            >
                                👁️ Önizle
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-base font-bold text-white shadow-sm transition-all hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    isEdit ? "✓ Güncelle" : "✓ Kaydet"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {showOnizle && onizleData && (
                <OnizleModal
                    data={onizleData}
                    onClose={() => setShowOnizle(false)}
                />
            )}
        </>
    );
}
