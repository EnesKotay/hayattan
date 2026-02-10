import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

async function importWordPressData() {
  try {
    console.log('🚀 WordPress verilerini import ediliyor...');

    // Önce temel kategoriler oluşturalım
    const kategoriler = [
      { name: 'Genel', slug: 'genel', description: 'Genel yazılar' },
      { name: 'Teknoloji', slug: 'teknoloji', description: 'Teknoloji yazıları' },
      { name: 'Yaşam', slug: 'yasam', description: 'Yaşam yazıları' },
      { name: 'Kültür', slug: 'kultur', description: 'Kültür yazıları' },
      { name: 'Sağlık', slug: 'saglik', description: 'Sağlık yazıları' }
    ];

    console.log('📂 Kategoriler oluşturuluyor...');
    for (const kategori of kategoriler) {
      await prisma.kategori.upsert({
        where: { slug: kategori.slug },
        update: {},
        create: kategori
      });
    }

    // Temel yazarlar oluşturalım
    const yazarlar = [
      {
        name: 'Hayattan.Net Editörü',
        slug: 'hayattan-editor',
        email: 'editor@hayattan.net',
        biyografi: 'Hayattan.Net ana editörü',
        misafir: false,
        ayrilmis: false,
        role: 'ADMIN' as const,
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAyqfhu' // admin123
      },
      {
        name: 'Misafir Yazar',
        slug: 'misafir-yazar',
        email: 'misafir@hayattan.net',
        biyografi: 'Misafir yazar hesabı',
        misafir: true,
        ayrilmis: false,
        role: 'AUTHOR' as const
      }
    ];

    console.log('👥 Yazarlar oluşturuluyor...');
    for (const yazar of yazarlar) {
      await prisma.yazar.upsert({
        where: { slug: yazar.slug },
        update: {},
        create: yazar
      });
    }

    // WordPress'den örnek yazılar oluşturalım
    const firstAuthor = await prisma.yazar.findFirst();
    const firstCategory = await prisma.kategori.findFirst();

    if (!firstAuthor || !firstCategory) {
      throw new Error('Yazar veya kategori bulunamadı');
    }

    const yazilar = [
      {
        title: 'Hayattan.Net\'e Hoş Geldiniz',
        slug: 'hayattan-net-hos-geldiniz',
        content: `<!-- wp:paragraph -->
<p>Hayattan.Net ailesi olarak sizleri sitemizde ağırlamaktan mutluluk duyuyoruz. Bu platform, yaşamın her alanından konuları ele alan, okuyucularına değer katan içerikler sunmayı hedeflemektedir.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Sitemizde teknolojiden sağlığa, kültürden yaşam tarzına kadar birçok farklı konuda yazılar bulabilirsiniz. Amacımız, okuyucularımızın günlük yaşamlarına katkı sağlayacak, onları düşündürecek ve ilham verecek içerikler üretmektir.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Hayattan.Net olarak, kaliteli içerik üretmeye ve okuyucularımızla güçlü bir bağ kurmaya odaklanıyoruz. Sizlerin görüş ve önerileriniz bizim için çok değerli.</p>
<!-- /wp:paragraph -->`,
        excerpt: 'Hayattan.Net ailesi olarak sizleri sitemizde ağırlamaktan mutluluk duyuyoruz.',
        authorId: firstAuthor.id,
        publishedAt: new Date('2024-01-15'),
        viewCount: 150,
        showInSlider: true,
        featuredImage: '/images/welcome.jpg',
        metaDescription: 'Hayattan.Net\'e hoş geldiniz. Yaşamın her alanından kaliteli içerikler.',
        metaKeywords: 'hayattan.net, hoş geldiniz, blog, yaşam'
      },
      {
        title: 'Teknolojinin Günlük Yaşamdaki Rolü',
        slug: 'teknolojinin-gunluk-yasamdaki-rolu',
        content: `<!-- wp:paragraph -->
<p>Günümüzde teknoloji, hayatımızın ayrılmaz bir parçası haline gelmiştir. Sabah uyandığımız andan gece yattığımız ana kadar, teknolojik cihazlar ve uygulamalar bizi çevrelemektedir.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Akıllı telefonlar, tabletler, bilgisayarlar ve diğer dijital cihazlar, iletişim kurma, bilgiye erişme ve günlük işlerimizi halletme şeklimizi köklü bir biçimde değiştirmiştir.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Bu değişim beraberinde hem avantajlar hem de dezavantajlar getirmektedir. Teknolojinin bilinçli kullanımı, hayat kalitemizi artırırken, aşırı kullanım ise çeşitli sorunlara yol açabilmektedir.</p>
<!-- /wp:paragraph -->`,
        excerpt: 'Teknolojinin günlük yaşamımızdaki artan rolü ve etkilerini inceliyoruz.',
        authorId: firstAuthor.id,
        publishedAt: new Date('2024-01-20'),
        viewCount: 89,
        showInSlider: false,
        metaDescription: 'Teknolojinin günlük yaşamdaki rolü ve etkileri hakkında detaylı analiz.',
        metaKeywords: 'teknoloji, günlük yaşam, dijital, akıllı telefon'
      },
      {
        title: 'Sağlıklı Yaşam İçin Pratik Öneriler',
        slug: 'saglikli-yasam-pratik-oneriler',
        content: `<!-- wp:paragraph -->
<p>Sağlıklı bir yaşam sürmek, günümüzün hızlı temposunda oldukça önemli hale gelmiştir. Doğru beslenme, düzenli egzersiz ve yeterli uyku, sağlıklı yaşamın temel taşlarıdır.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Dengeli bir diyet, vücudumuzun ihtiyaç duyduğu tüm besin öğelerini içermelidir. Bol su içmek, taze meyve ve sebze tüketmek, işlenmiş gıdalardan kaçınmak önemli adımlardır.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Düzenli egzersiz yapmak, sadece fiziksel sağlığımızı değil, mental sağlığımızı da olumlu yönde etkiler. Haftada en az 3-4 kez, 30 dakikalık yürüyüş bile büyük fark yaratabilir.</p>
<!-- /wp:paragraph -->`,
        excerpt: 'Sağlıklı yaşam için uygulanabilir pratik öneriler ve ipuçları.',
        authorId: firstAuthor.id,
        publishedAt: new Date('2024-01-25'),
        viewCount: 134,
        showInSlider: true,
        metaDescription: 'Sağlıklı yaşam için pratik öneriler: beslenme, egzersiz ve uyku.',
        metaKeywords: 'sağlıklı yaşam, beslenme, egzersiz, sağlık'
      }
    ];

    console.log('📝 Yazılar oluşturuluyor...');
    for (const yazi of yazilar) {
      await prisma.yazi.upsert({
        where: { slug: yazi.slug },
        update: {},
        create: yazi
      });
    }

    // Temel sayfalar oluşturalım
    const sayfalar = [
      {
        title: 'Hakkımızda',
        slug: 'hakkimizda',
        content: `<!-- wp:paragraph -->
<p>Hayattan.Net, 2018 yılından bu yana okuyucularına kaliteli içerikler sunan bir dijital yayın platformudur. Yaşamın her alanından konuları ele alan sitemiz, okuyucularının günlük yaşamlarına değer katmayı hedeflemektedir.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Misyonumuz, doğru ve güvenilir bilgileri okuyucularımızla paylaşmak, onları düşündürecek ve ilham verecek içerikler üretmektir. Teknolojiden sağlığa, kültürden yaşam tarzına kadar geniş bir yelpazede yazılar yayınlamaktayız.</p>
<!-- /wp:paragraph -->`,
        showInMenu: true,
        menuOrder: 1
      },
      {
        title: 'İletişim',
        slug: 'iletisim',
        content: `<!-- wp:paragraph -->
<p>Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz:</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>E-posta:</strong> info@hayattan.net</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Sosyal Medya:</strong> Bizi sosyal medya hesaplarımızdan takip edebilirsiniz.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Görüş, öneri ve sorularınızı bizimle paylaşmaktan çekinmeyin. Geri dönüşleriniz bizim için çok değerli.</p>
<!-- /wp:paragraph -->`,
        showInMenu: true,
        menuOrder: 2
      }
    ];

    console.log('📄 Sayfalar oluşturuluyor...');
    for (const sayfa of sayfalar) {
      await prisma.page.upsert({
        where: { slug: sayfa.slug },
        update: {},
        create: sayfa
      });
    }

    // Sonuçları göster
    const [kategoriCount, yazarCount, yaziCount, sayfaCount] = await Promise.all([
      prisma.kategori.count(),
      prisma.yazar.count(),
      prisma.yazi.count(),
      prisma.page.count()
    ]);

    console.log('✅ Import tamamlandı!');
    console.log(`📊 Toplam veriler:`);
    console.log(`   Kategoriler: ${kategoriCount}`);
    console.log(`   Yazarlar: ${yazarCount}`);
    console.log(`   Yazılar: ${yaziCount}`);
    console.log(`   Sayfalar: ${sayfaCount}`);

    // Admin kullanıcısı bilgilerini göster
    const admin = await prisma.yazar.findFirst({ where: { role: 'ADMIN' } });
    if (admin) {
      console.log('\n🔑 Admin Kullanıcısı:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Şifre: admin123`);
      console.log(`   Admin Paneli: https://hayattan-net.vercel.app/admin/giris`);
    }

  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importWordPressData();