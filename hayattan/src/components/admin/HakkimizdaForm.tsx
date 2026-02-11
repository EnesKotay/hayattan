"use client";

import { useState } from "react";
import Link from "next/link";
import { FormField, FormSection } from "@/components/admin/FormField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { saveHakkimizdaContent, type HakkimizdaContent } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/ToastProvider";

type HakkimizdaFormProps = {
    defaultValues: HakkimizdaContent;
};

export function HakkimizdaForm({ defaultValues }: HakkimizdaFormProps) {
    const [mainContent, setMainContent] = useState(defaultValues.mainContent);
    const [detailsContent, setDetailsContent] = useState(defaultValues.detailsContent);
    const [rulesContent, setRulesContent] = useState(defaultValues.rulesContent);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { success, error: showError } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        formData.set("mainContent", mainContent);
        formData.set("detailsContent", detailsContent);
        formData.set("rulesContent", rulesContent);
        try {
            await saveHakkimizdaContent(formData);
            success("Hakkımızda Sayfası Güncellendi", "İçerik başarıyla kaydedildi.");
        } catch (err) {
            showError("Hata Oluştu", err instanceof Error ? err.message : "Kaydedilirken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden inputs for rich text content */}
            <input type="hidden" name="mainContent" value={mainContent} />
            <input type="hidden" name="detailsContent" value={detailsContent} />
            <input type="hidden" name="rulesContent" value={rulesContent} />

            {/* Kapak Görseli */}
            <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <ImageUpload
                    name="imageUrl"
                    label="Sayfa Kapak Görseli"
                    help="Hakkımızda sayfasının en üstünde görünecek geniş görsel. (Örn: Ekip fotoğrafı)"
                    defaultValue={defaultValues.imageUrl}
                />
            </div>

            <FormSection title="1. Ana Bölüm">
                <FormField
                    label="Bölüm Başlığı"
                    help="Sayfanın en üstündeki ana başlık."
                >
                    <input
                        name="mainTitle"
                        defaultValue={defaultValues.mainTitle}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </FormField>
                <FormField
                    label="İçerik"
                    help="Genel tanıtım metni."
                >
                    <RichTextEditor
                        value={mainContent}
                        onChange={setMainContent}
                        placeholder="İçerik..."
                    />
                </FormField>
            </FormSection>

            <FormSection title="2. Bilinmesi Gereken Detaylar">
                <FormField
                    label="Bölüm Başlığı"
                    help="İkinci bölümün başlığı."
                >
                    <input
                        name="detailsTitle"
                        defaultValue={defaultValues.detailsTitle}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </FormField>
                <FormField
                    label="İçerik (Liste)"
                    help="Maddeler halinde detaylar. Editörden 'Liste' özelliğini kullanabilirsiniz."
                >
                    <RichTextEditor
                        value={detailsContent}
                        onChange={setDetailsContent}
                        placeholder="Detaylar..."
                    />
                </FormField>
            </FormSection>

            <FormSection title="3. Yayın Kuralları">
                <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                    Not: Bu bölüm sitede mavi çerçeveli özel bir kutu içinde gösterilir.
                </div>
                <FormField
                    label="Bölüm Başlığı"
                    help="Kurallar bölümünün başlığı."
                >
                    <input
                        name="rulesTitle"
                        defaultValue={defaultValues.rulesTitle}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </FormField>
                <FormField
                    label="İçerik (Liste)"
                    help="Yayınlanacak yazılar için kurallar listesi."
                >
                    <RichTextEditor
                        value={rulesContent}
                        onChange={setRulesContent}
                        placeholder="Kurallar..."
                    />
                </FormField>
            </FormSection>

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                    {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <Link
                    href="/admin"
                    className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-medium text-foreground transition-colors hover:bg-gray-50"
                >
                    İptal
                </Link>
            </div>
        </form>
    );
}
