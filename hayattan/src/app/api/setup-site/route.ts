import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { adminEmail = "admin@hayattan.net", adminPassword = "admin123", adminName = "Site Yöneticisi" } = await request.json();

    console.log("🚀 Site kurulumu başlatılıyor...");

    // 1. Database bağlantısını test et
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database bağlantısı başarılı");

    // 2. Mevcut veri sayılarını kontrol et
    const existingCounts = {
      kategoriler: await prisma.kategori.count(),
      yazarlar: await prisma.yazar.count(),
      yazilar: await prisma.yazi.count(),
      sayfalar: await prisma.page.count()
    };

    console.log("📊 Mevcut veriler:", existingCounts);

    // 3. Temel kategorileri oluştur
    const kategoriler = await Promise.all([
      prisma.kategori.upsert({
        where: { slug: "teknoloji" },
        update: {},
        create: { name: "Teknoloji", slug: "teknoloji", description: "Teknoloji ile ilgili yazılar" }
      }),
      prisma.kategori.upsert({
        where: { slug: "yasam" },
        update: {},
        create: { name: "Yaşam", slug: "yasam", description: "Yaşam ile ilgili yazılar" }
      }),
      prisma.kategori.upsert({
        where: { slug: "misafir-yazarlar" },
        update: {},
        create: { name: "Misafir Yazarlar", slug: "misafir-yazarlar", description: "Misafir yazarların yazıları" }
      }),
      prisma.kategori.upsert({
        where: { slug: "fotografhane" },
        update: {},
        create: { name: "Fotoğrafhane", slug: "fotografhane", description: "Fotoğraf ve görsel içerikler" }
      }),
      prisma.kategori.upsert({
        where: { slug: "bakis-dergisi" },
        update: {},
        create: { name: "Bakış Dergisi", slug: "bakis-dergisi", description: "Bakış Dergisi yazıları" }
      })
    ]);

    console.log("✅ Kategoriler oluşturuldu");

    // 4. Admin kullanıcısını oluştur
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.yazar.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: adminName,
        slug: "admin",
        email: adminEmail,
        password: hashedPassword,
        biyografi: "Site yöneticisi",
        role: "ADMIN",
        misafir: false,
        ayrilmis: false
      }
    });

    console.log("✅ Admin kullanıcısı oluşturuldu");

    // 5. Test yazarları oluştur
    const yazarlar = await Promise.all([
      prisma.yazar.upsert({
        where: { slug: "test-yazar" },
        update: {},
        create: {
          name: "Test Yazar",
          slug: "test-yazar",
          email: "test@hayattan.net",
          biyografi: "Test yazarı",
          misafir: false,
          ayrilmis: false
        }
      }),
      prisma.yazar.upsert({
        where: { slug: "misafir-yazar" },
        update: {},
        create: {
          name: "Misafir Yazar",
          slug: "misafir-yazar",
          email: "misafir@hayattan.net",
          biyografi: "Misafir yazar",
          misafir: true,
          ayrilmis: false
        }
      })
    ]);

    console.log("✅ Test yazarları oluşturuldu");

    // 6. Test yazıları oluştur
    const yazilar = await Promise.all([
      prisma.yazi.upsert({
        where: { slug: "hosgeldiniz-hayattan-net" },
        update: {},
        create: {
          title: "Hoşgeldiniz - Hayattan.Net",
          slug: "hosgeldiniz-hayattan-net",
          excerpt: "Hayattan.Net'e hoşgeldiniz! Bu platformda teknoloji, yaşam ve daha birçok konuda kaliteli içerikler bulabilirsiniz.",
          content: `<h2>Hayattan.Net'e Hoşgeldiniz!</h2>
          <p>Bu site, hayatın her alanından kaliteli içerikleri sizlerle buluşturmak için kurulmuştur.</p>
          <h3>Neler Bulabilirsiniz?</h3>
          <ul>
            <li><strong>Teknoloji:</strong> En güncel teknoloji haberleri ve analizleri</li>
            <li><strong>Yaşam:</strong> Günlük hayatı kolaylaştıran ipuçları</li>
            <li><strong>Misafir Yazıları:</strong> Değerli misafir yazarlarımızın katkıları</li>
          </ul>
          <p>İyi okumalar dileriz!</p>`,
          authorId: admin.id,
          publishedAt: new Date(),
          viewCount: 0,
          kategoriler: { connect: { id: kategoriler[0].id } }
        }
      }),
      prisma.yazi.upsert({
        where: { slug: "teknoloji-dunyasinda-yenilikler" },
        update: {},
        create: {
          title: "Teknoloji Dünyasında Yenilikler",
          slug: "teknoloji-dunyasinda-yenilikler",
          excerpt: "2024 yılında teknoloji dünyasında yaşanan en önemli gelişmeleri inceliyoruz.",
          content: `<h2>Teknoloji Dünyasında Neler Oluyor?</h2>
          <p>Bu yıl teknoloji sektöründe birçok önemli gelişme yaşandı. Yapay zeka, blockchain ve mobil teknolojilerdeki ilerlemeler dikkat çekiyor.</p>
          <h3>Öne Çıkan Konular:</h3>
          <ul>
            <li>Yapay Zeka ve Machine Learning</li>
            <li>Web3 ve Blockchain teknolojileri</li>
            <li>Mobil uygulama geliştirme trendleri</li>
          </ul>`,
          authorId: yazarlar[0].id,
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 gün önce
          viewCount: 15,
          kategoriler: { connect: { id: kategoriler[0].id } }
        }
      }),
      prisma.yazi.upsert({
        where: { slug: "saglikli-yasam-onerileri" },
        update: {},
        create: {
          title: "Sağlıklı Yaşam Önerileri",
          slug: "saglikli-yasam-onerileri",
          excerpt: "Günlük hayatınızda uygulayabileceğiniz basit ama etkili sağlık önerileri.",
          content: `<h2>Sağlıklı Yaşam İçin Basit Adımlar</h2>
          <p>Sağlıklı bir yaşam sürmek için karmaşık diyetlere veya pahalı ürünlere ihtiyacınız yok.</p>
          <h3>Günlük Öneriler:</h3>
          <ul>
            <li>Bol su için (günde en az 8 bardak)</li>
            <li>Düzenli egzersiz yapın (günde 30 dakika yürüyüş bile yeterli)</li>
            <li>Kaliteli uyku alın (7-8 saat)</li>
            <li>Sebze ve meyve tüketimini artırın</li>
          </ul>`,
          authorId: yazarlar[0].id,
          publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 gün önce
          viewCount: 23,
          kategoriler: { connect: { id: kategoriler[1].id } }
        }
      }),
      prisma.yazi.upsert({
        where: { slug: "misafir-yazar-deneyimleri" },
        update: {},
        create: {
          title: "Misafir Yazar Deneyimlerim",
          slug: "misafir-yazar-deneyimleri",
          excerpt: "Farklı platformlarda misafir yazar olarak yazdığım deneyimlerimi paylaşıyorum.",
          content: `<h2>Misafir Yazar Olmak</h2>
          <p>Farklı platformlarda yazı yazmak, hem kişisel gelişim hem de network kurma açısından çok değerli.</p>
          <h3>Kazanımlarım:</h3>
          <ul>
            <li>Farklı bakış açıları geliştirme</li>
            <li>Yeni insanlarla tanışma</li>
            <li>Yazma becerilerimi geliştirme</li>
          </ul>`,
          authorId: yazarlar[1].id,
          publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 gün önce
          viewCount: 8,
          kategoriler: { connect: { id: kategoriler[2].id } }
        }
      })
    ]);

    console.log("✅ Test yazıları oluşturuldu");

    // 7. Temel sayfaları oluştur
    const sayfalar = await Promise.all([
      prisma.page.upsert({
        where: { slug: "hakkimizda" },
        update: {},
        create: {
          title: "Hakkımızda",
          slug: "hakkimizda",
          content: `<h2>Hayattan.Net Hakkında</h2>
          <p>Hayattan.Net, hayatın her alanından kaliteli içerikleri okuyucularıyla buluşturan bir platformdur.</p>
          <h3>Misyonumuz</h3>
          <p>Teknolojiden yaşama, kültürden spora kadar geniş bir yelpazede, güncel ve faydalı bilgileri paylaşmak.</p>
          <h3>Vizyonumuz</h3>
          <p>Türkiye'nin en güvenilir ve kaliteli içerik platformlarından biri olmak.</p>`,
          publishedAt: new Date(),
          menuOrder: 1
        }
      }),
      prisma.page.upsert({
        where: { slug: "iletisim" },
        update: {},
        create: {
          title: "İletişim",
          slug: "iletisim",
          content: `<h2>İletişim Bilgileri</h2>
          <p>Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.</p>
          <h3>E-posta</h3>
          <p>info@hayattan.net</p>
          <h3>Sosyal Medya</h3>
          <p>Sosyal medya hesaplarımızdan bizi takip edebilirsiniz.</p>`,
          publishedAt: new Date(),
          menuOrder: 2
        }
      })
    ]);

    console.log("✅ Temel sayfalar oluşturuldu");

    // 8. Final sayıları al
    const finalCounts = {
      kategoriler: await prisma.kategori.count(),
      yazarlar: await prisma.yazar.count(),
      yazilar: await prisma.yazi.count(),
      sayfalar: await prisma.page.count(),
      adminler: await prisma.yazar.count({ where: { role: 'ADMIN' } })
    };

    console.log("🎉 Site kurulumu tamamlandı!");

    return NextResponse.json({
      success: true,
      message: "🎉 Site kurulumu başarıyla tamamlandı!",
      data: {
        before: existingCounts,
        after: finalCounts,
        admin: {
          email: adminEmail,
          name: adminName,
          loginUrl: "/admin/giris"
        },
        testUrls: [
          "/",
          "/yazilar", 
          "/yazarlar",
          "/misafir-yazarlar",
          "/hakkimizda",
          "/admin/giris"
        ]
      }
    });

  } catch (error) {
    console.error("❌ Site kurulum hatası:", error);
    
    return NextResponse.json({
      success: false,
      message: "Site kurulumu başarısız",
      error: error instanceof Error ? error.message : "Bilinmeyen hata"
    }, { status: 500 });
  }
}