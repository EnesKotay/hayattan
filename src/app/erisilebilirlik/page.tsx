import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Erişilebilirlik",
  description: "Hayattan.Net erişilebilirlik özellikleri, kullanım seçenekleri ve geri bildirim kanalları.",
  alternates: { canonical: "/erisilebilirlik" },
};

const features = [
  "İçeriğe atla bağlantısı ve görünür klavye odakları",
  "Açık, koyu ve yüksek kontrast görünümleri",
  "Ayarlanabilir yazı boyutu ve disleksi dostu okuma modu",
  "Hareket efektlerini azaltma seçeneği",
  "Yazıları tarayıcı üzerinden sesli dinleme desteği",
  "Kapak görselleri için zorunlu alternatif metin",
];

export default function ErisilebilirlikPage() {
  return (
    <main className="bg-background px-4 py-12 md:py-16">
      <div className="container mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Hayatın Engelsiz Tarafı</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl">Erişilebilirlik</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Hayattan.Net’i farklı görme, okuma, hareket ve teknoloji ihtiyaçlarına sahip okurlar için
          kullanılabilir tutmayı amaçlıyoruz. Görünüm menüsündeki tercihler cihazınızda saklanır.
        </p>

        <section className="mt-10 rounded-2xl border border-border bg-muted-bg/30 p-6 md:p-8">
          <h2 className="font-serif text-2xl font-bold text-foreground">Mevcut özellikler</h2>
          <ul className="mt-5 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex gap-3 leading-relaxed text-foreground">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold text-foreground">Bir engelle karşılaştınız mı?</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Kullanamadığınız bir alanı, kullandığınız cihazı veya yardımcı teknolojiyi ve mümkünse ilgili
            sayfanın adresini bize bildirin. Sorunu inceleyip erişilebilir bir alternatif sunmaya çalışacağız.
          </p>
          <a
            href="mailto:hayattan.net2@gmail.com?subject=Erişilebilirlik%20geri%20bildirimi"
            className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover"
          >
            Erişilebilirlik geri bildirimi gönder
          </a>
        </section>

        <div className="mt-12 border-t border-border pt-8">
          <Link href="/" className="font-semibold text-primary hover:underline">← Ana sayfaya dön</Link>
        </div>
      </div>
    </main>
  );
}
