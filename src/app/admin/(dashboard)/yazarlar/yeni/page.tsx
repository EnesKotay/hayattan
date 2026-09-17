"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createYazar } from "@/backend/modules/authors/actions";
import { FormField, FormSection } from "@/frontend/admin/ui/FormField";
import { ImageUpload } from "@/frontend/admin/media/ImageUpload";
import { Icons } from "@/frontend/admin/ui/Icons";

// Slug oluşturma
function generateSlug(name: string): string {
  return name
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

export default function YeniYazarPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isMisafir, setIsMisafir] = useState(false);
  const [isAyrilmis, setIsAyrilmis] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  // Otomatik slug
  useEffect(() => {
    if (autoSlug && name) {
      setSlug(generateSlug(name));
    }
  }, [name, autoSlug]);

  // İlerleme hesaplama
  const requiredFields = [!!name];
  const progress = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Yeni Yazar Ekle
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Yazarın temel bilgilerini girin ve kaydedin.
          </p>
        </div>
        <Link
          href="/admin/yazarlar"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Icons.User className="h-4 w-4" />
          Yazarlara Dön
        </Link>
      </div>

      {/* İlerleme */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Form İlerlemesi</span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form action={createYazar} className="space-y-6">
        {/* Temel Bilgiler */}
        <FormSection title="👤 Temel Bilgiler">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField label="Ad Soyad" required>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {name && (
                <div className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                  <Icons.CheckCircle className="h-3 w-3" />
                  <span>İsim girildi</span>
                </div>
              )}
            </FormField>

            <FormField label="E-posta" help="İsteğe bağlı">
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </FormField>

            <FormField label="Sıralama" help="Küçük sayı üste çıkar">
              <input
                name="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </FormField>
          </div>

          <FormField label="Sayfa Adresi (URL)">
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="ahmet-yilmaz"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {slug && (
              <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-900 mb-1">📎 URL Önizleme:</p>
                <p className="text-xs font-mono text-blue-700 break-all">
                  hayattan.net/yazarlar/<span className="font-bold">{slug}</span>
                </p>
              </div>
            )}
            {!slug && name && (
              <p className="mt-1.5 text-xs text-gray-500">
                Boş bırakırsanız otomatik: <span className="font-mono">{generateSlug(name)}</span>
              </p>
            )}
          </FormField>
        </FormSection>

        {/* Yazar Tipi */}
        <FormSection title="🏷️ Yazar Tipi">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Misafir Yazar */}
            <label className={`group flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${isMisafir
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50'
              }`}>
              <input
                type="checkbox"
                name="misafir"
                checked={isMisafir}
                onChange={(e) => {
                  setIsMisafir(e.target.checked);
                  if (e.target.checked) setIsAyrilmis(false);
                }}
                className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Icons.User className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-gray-900">Misafir Yazar</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Site dışından konuk yazar
                </p>
              </div>
            </label>

            {/* Eski Yazar */}
            <label className={`group flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${isAyrilmis
              ? 'border-gray-400 bg-gray-100'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}>
              <input
                type="checkbox"
                name="ayrilmis"
                checked={isAyrilmis}
                onChange={(e) => {
                  setIsAyrilmis(e.target.checked);
                  if (e.target.checked) setIsMisafir(false);
                }}
                className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-gray-600 focus:ring-2 focus:ring-gray-500/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Icons.XCircle className="h-4 w-4 text-gray-600" />
                  <span className="font-bold text-gray-900">Eski Yazar</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Şirketten ayrılmış
                </p>
              </div>
            </label>
          </div>

          {/* Uyarı mesajları */}
          {isMisafir && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                <Icons.Info className="inline h-4 w-4 mr-1" />
                Bu yazar misafir yazarlar listesinde görünecek
              </p>
            </div>
          )}
          {isAyrilmis && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-900">
                <Icons.AlertTriangle className="inline h-4 w-4 mr-1" />
                Bu yazarın yazıları sadece "Eski Yazılar" sayfasında listelenir
              </p>
            </div>
          )}
        </FormSection>

        {/* Profil Bilgileri */}
        <FormSection title="📸 Profil Bilgileri">
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6">
            <ImageUpload
              name="photo"
              label="Profil Fotoğrafı"
              help="500x500px kare görsel önerilir - JPG/PNG"
            />
          </div>

          <FormField label="Kısa Biyografi" help="Yazar hakkında tanıtım metni">
            <textarea
              name="biyografi"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Yazar hakkında kısa bir tanıtım yazın..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {bio.length >= 50 ? "✓ İdeal uzunluk" : "50-200 karakter önerilir"}
              </span>
              <span className={`font-medium ${bio.length > 200 ? 'text-amber-600' : 'text-gray-600'}`}>
                {bio.length} karakter
              </span>
            </div>
          </FormField>
        </FormSection>

        {/* Butonlar */}
        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover px-8 py-3 text-base font-bold text-white shadow-md transition-all hover:shadow-lg"
          >
            <Icons.CheckCircle className="h-5 w-5" />
            Yazarı Kaydet
          </button>
          <Link
            href="/admin/yazarlar"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
