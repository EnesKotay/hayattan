export const metadata = {
  title: "Gizlilik Politikası | Hayattan.Net",
  description: "Hayattan.Net gizlilik politikası ve kişisel verilerin korunması",
};

export default function GizlilikPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <article className="prose prose-lg mx-auto">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Gizlilik Politikası
        </h1>

        <div className="mt-8 space-y-6 text-foreground">
          <section>
            <h2 className="font-serif text-2xl font-semibold">1. Genel Bilgiler</h2>
            <p className="text-muted">
              Hayattan.Net olarak kullanıcılarımızın gizliliğine önem veririz. 
              Bu politika, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">2. Toplanan Bilgiler</h2>
            <p className="text-muted">
              Web sitemizi ziyaret ettiğinizde, tarayıcı türü, IP adresi, ziyaret edilen sayfalar 
              ve ziyaret süreleri gibi teknik bilgiler otomatik olarak toplanabilir.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">3. Bilgilerin Kullanımı</h2>
            <p className="text-muted">
              Toplanan bilgiler yalnızca site deneyimini iyileştirmek, içerik önerilerinde bulunmak 
              ve istatistiksel analizler yapmak için kullanılır.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">4. Çerezler (Cookies)</h2>
            <p className="text-muted">
              Sitemiz, kullanıcı deneyimini geliştirmek için çerezler kullanabilir. 
              Tarayıcı ayarlarınızdan çerezleri yönetebilir veya devre dışı bırakabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">5. Üçüncü Taraf Hizmetler</h2>
            <p className="text-muted">
              Sitemiz, analitik ve reklam hizmetleri için üçüncü taraf araçları kullanabilir. 
              Bu hizmetlerin kendi gizlilik politikaları bulunmaktadır.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">6. Veri Güvenliği</h2>
            <p className="text-muted">
              Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri alıyoruz.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">7. Haklarınız</h2>
            <p className="text-muted">
              KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında verilerinize erişim, 
              düzeltme ve silme haklarına sahipsiniz.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold">8. İletişim</h2>
            <p className="text-muted">
              Gizlilik politikası hakkında sorularınız için bizimle iletişime geçebilirsiniz.
            </p>
          </section>

          <section>
            <p className="text-sm text-muted">
              <strong>Son güncelleme:</strong> {new Date().toLocaleDateString("tr-TR")}
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
