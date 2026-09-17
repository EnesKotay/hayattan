"use client";

import { useActionState } from "react";
import Link from "next/link";
import { SubmitButton } from "@/frontend/admin/ui/SubmitButton";
import { ImageUpload } from "@/frontend/admin/media/ImageUpload";
import { useToast } from "@/frontend/admin/ui/ToastProvider";
import { useState } from "react";

type HaberFormProps = {
    action: (payload: FormData) => void;
    defaultValues?: {
        id?: string;
        title: string;
        excerpt?: string;
        imageUrl?: string;
        link?: string;
        authorName?: string;
        sortOrder: number;
        publishedAt?: Date | null;
    };
    isEdit?: boolean;
};

export function HaberForm({
    action,
    defaultValues,
    isEdit = false,
}: HaberFormProps) {
    const { success, error: showError } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        try {
            await action(formData);
            success("Haber başarıyla kaydedildi.", "Değişiklikler sisteme işlendi.");
        } catch (err) {
            showError("Hata Oluştu", err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
                {/* TEMEL BİLGİLER KARTI */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            📝
                        </span>
                        <h2 className="font-semibold text-gray-900">Manşet/Haber Detayları</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Haber Başlığı <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                defaultValue={defaultValues?.title}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Örn: 'Büyük İcat!'"
                            />
                        </div>

                        <div>
                            <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Öne Çıkan Kısa Yazı (Özet)
                            </label>
                            <textarea
                                id="excerpt"
                                name="excerpt"
                                rows={3}
                                defaultValue={defaultValues?.excerpt}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Haberin kısa özeti..."
                            />
                            <p className="mt-1 text-xs text-muted">Slider üzerinde görünecek kısa metin.</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="authorName" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Görünen Yazar Adı
                                </label>
                                <input
                                    type="text"
                                    id="authorName"
                                    name="authorName"
                                    defaultValue={defaultValues?.authorName}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="Örn: 'Editör Masası'"
                                />
                            </div>
                            <div>
                                <label htmlFor="sortOrder" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Görünüm Sırası (1=İlk Sırada)
                                </label>
                                <input
                                    type="number"
                                    id="sortOrder"
                                    name="sortOrder"
                                    defaultValue={defaultValues?.sortOrder ?? 0}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
                {/* YAYINLAMA AYARLARI */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                            🚀
                        </span>
                        <h2 className="font-semibold text-gray-900">Yayınlama</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="publishedAt" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Yayın Durumu
                            </label>
                            <select
                                id="publishedAt"
                                name="publishedAt"
                                defaultValue={defaultValues?.publishedAt ? "now" : ""}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="now">Sitede Göster (Aktif)</option>
                                <option value="">Gizle (Taslak Olarak Kalsın)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* MEDYA & LİNK */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                            🖼️
                        </span>
                        <h2 className="font-semibold text-gray-900">Fotoğraf ve Bağlantı</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <ImageUpload
                                name="imageUrl"
                                label="Haber Fotoğrafı"
                                help="Slider üzerinde görünecek ana fotoğraf."
                                defaultValue={defaultValues?.imageUrl}
                            />
                        </div>

                        <div>
                            <label htmlFor="link" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Tıklandığında Gidilecek Sayfa
                            </label>
                            <input
                                type="text"
                                id="link"
                                name="link"
                                defaultValue={defaultValues?.link}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="/yazilar/slug veya https://..."
                            />
                            <p className="mt-1 text-xs text-muted">Tıklandığında gideceği adres (Boş bırakılabilir).</p>
                        </div>
                    </div>
                </div>

                {/* AKSİYON BUTONLARI */}
                <div className="flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                    >
                        {isSubmitting ? "Kaydediliyor..." : (isEdit ? "Değişiklikleri Kaydet" : "Haberi Oluştur")}
                    </button>
                    <Link
                        href="/admin/haberler"
                        className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                        İptal
                    </Link>
                </div>
            </div>
        </form>
    );
}
