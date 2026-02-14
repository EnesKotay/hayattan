export const metadata = {
  title: "Kullanım Şartları | Hayattan.Net",
  description: "Hayattan.Net kullanım şartları ve koşulları",
};

export default function KullanimSartlariPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <article className="prose prose-lg mx-auto">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Kullanım Şartları
        </h1>

        <div className="mt-8 space-y-6 text-foreground">
          <section>
            <h2 className="font-serif text-2xl font-semibold">1. Genel Koşullar</h2>
            <p className="text-muted">
              Hayattan.Net web sitesini kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. 
              Bu şartlar zaman zaman güncellenebilir.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">2. Fikri Mülkiyet Hakları</h2>
            <p className="text-muted">
              Bu sitede yayınlanan tüm içerikler (yazılar, görseller, tasarımlar) Hayattan.Net&apos;e aittir. 
              İçeriklerin izinsiz kopyalanması, çoğaltılması veya dağıtılması yasaktır.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">3. Kullanıcı Sorumlulukları</h2>
            <p className="text-muted">
              Kullanıcılar, siteyi yasalara uygun şekilde kullanmakla yükümlüdür. 
              Zararlı, hakaret içeren veya yanıltıcı içerik paylaşmak yasaktır.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">4. Sorumluluk Sınırlaması</h2>
            <p className="text-muted">
              Hayattan.Net, sitede yer alan bilgilerin doğruluğu ve güncelliği konusunda 
              azami özeni gösterir ancak herhangi bir garanti vermez.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">5. Değişiklikler</h2>
            <p className="text-muted">
              Hayattan.Net, bu kullanım şartlarını önceden haber vermeksizin değiştirme hakkını saklı tutar.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">6. İletişim</h2>
            <p className="text-muted">
              Kullanım şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
