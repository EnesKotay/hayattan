"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * HTML'den düz metin çıkarır ve görme engelliler için optimize eder.
 * Gereksiz boşlukları temizler, liste işaretlerini korur.
 */
function stripHtmlToText(html: string): string {
  if (typeof document === "undefined") return "";
  const div = document.createElement("div");
  div.innerHTML = html;

  // Liste elemanlarını temizle ve düzenle
  div.querySelectorAll('li').forEach((li, index) => {
    li.textContent = `${index + 1}.  ${li.textContent?.trim() || ''}`;
  });

  // Paragraflar arası boşluk ekle
  div.querySelectorAll('p').forEach((p) => {
    p.textContent = (p.textContent?.trim() || '') + '. ';
  });

  const text = (div.innerText || div.textContent || "").trim();
  // Çift boşlukları temizle
  return text.replace(/\s+/g, ' ');
}

/**
 * Süreyi formatlar (örn: "2:30")
 */
function formatSure(saniye: number): string {
  const dk = Math.floor(saniye / 60);
  const sn = Math.floor(saniye % 60);
  return `${dk}:${sn.toString().padStart(2, '0')}`;
}

type SesliOkuButtonProps = {
  /** Yazı başlığı (önce okunur). */
  title: string;
  /** Yazı içeriği (HTML). Sesli okumada etiketler çıkarılır. */
  htmlContent: string;
  /** Yazı ID'si (bookmark için). */
  articleId?: string;
  /** Erişilebilirlik: buton grubu etiketi. */
  ariaLabel?: string;
  className?: string;
};

export function SesliOkuButton({
  title,
  htmlContent,
  articleId,
  ariaLabel = "Görme engelliler için sesli okuma kontrolleri",
  className = "",
}: SesliOkuButtonProps) {
  // Durum yönetimi
  const [durum, setDurum] = useState<"hazir" | "oynatiliyor" | "duraklatildi">("hazir");
  const [destekleniyor, setDestekleniyor] = useState(true);

  // İlerleme tracking
  const [ilerleme, setIlerleme] = useState(0);
  const [gecenSure, setGecenSure] = useState(0);
  const [tahminiSure, setTahminiSure] = useState(0);
  const baslangicZamani = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Screen reader announcements
  const [duyuru, setDuyuru] = useState("");

  // Kullanıcı tercihleri
  const [hiz, setHiz] = useState(0.95);
  const [tonlama, setTonlama] = useState(1.0);
  const [sesSecimi, setSesSecimi] = useState<string | null>(null);
  const [mevcutSesler, setMevcutSesler] = useState<SpeechSynthesisVoice[]>([]);
  const [kaydedilmisPozisyon, setKaydedilmisPozisyon] = useState(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const controlerRef = useRef<HTMLDivElement>(null);

  // Mevcut sesleri yükle
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setDestekleniyor(false);
      return;
    }

    const seslerYukle = () => {
      const voices = window.speechSynthesis.getVoices();
      // Türkçe sesleri önceliklendir
      const turkceVoices = voices.filter(v => v.lang.startsWith('tr'));
      const digerVoices = voices.filter(v => !v.lang.startsWith('tr'));
      setMevcutSesler([...turkceVoices, ...digerVoices]);

      // İlk Türkçe sesi otomatik seç
      if (turkceVoices.length > 0 && !sesSecimi) {
        setSesSecimi(turkceVoices[0].name);
      }
    };

    seslerYukle();
    window.speechSynthesis.onvoiceschanged = seslerYukle;

    // localStorage'dan tercihleri yükle
    const kaydedilmisHiz = localStorage.getItem('sesli-oku-hiz');
    const kaydedilmisTon = localStorage.getItem('sesli-oku-ton');
    const kaydedilmisSes = localStorage.getItem('sesli-oku-ses');

    if (kaydedilmisHiz) setHiz(parseFloat(kaydedilmisHiz));
    if (kaydedilmisTon) setTonlama(parseFloat(kaydedilmisTon));
    if (kaydedilmisSes) setSesSecimi(kaydedilmisSes);

    // Kaydedilmiş pozisyonu yükle
    if (articleId) {
      const pozisyon = localStorage.getItem(`sesli-oku-pozisyon-${articleId}`);
      if (pozisyon) setKaydedilmisPozisyon(parseFloat(pozisyon));
    }

    return () => {
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [articleId, sesSecimi]);

  // Timer için useEffect
  useEffect(() => {
    if (durum === "oynatiliyor") {
      timerRef.current = setInterval(() => {
        const gecen = (Date.now() - baslangicZamani.current) / 1000;
        setGecenSure(gecen);

        // Her 10 saniyede bir ilerlemeyi duyur
        if (Math.floor(gecen) % 10 === 0 && gecen > 0) {
          setDuyuru(`Okuma devam ediyor. ${Math.floor(ilerleme)} yüzde tamamlandı.`);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [durum, ilerleme]);

  const getOkunacakMetin = useCallback(() => {
    const metin = stripHtmlToText(htmlContent);
    if (!metin) return "";
    return `${title}. ${metin}`;
  }, [title, htmlContent]);

  const baslat = useCallback((pozisyondanBasla = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setDestekleniyor(false);
      return;
    }

    const metin = getOkunacakMetin();
    if (!metin) return;

    window.speechSynthesis.cancel();
    setIlerleme(0);

    const u = new SpeechSynthesisUtterance(metin);
    u.lang = "tr-TR";
    u.rate = hiz;
    u.pitch = tonlama;
    u.volume = 1;

    // Kullanıcının seçtiği sesi kullan
    if (sesSecimi) {
      const seciliSes = mevcutSesler.find(v => v.name === sesSecimi);
      if (seciliSes) {
        u.voice = seciliSes;
      }
    }

    // İlerleme tracking
    u.onboundary = (event) => {
      const okunan = event.charIndex;
      const toplam = metin.length;
      const yuzde = (okunan / toplam) * 100;
      setIlerleme(yuzde);

      // Pozisyonu kaydet
      if (articleId) {
        localStorage.setItem(`sesli-oku-pozisyon-${articleId}`, yuzde.toString());
      }
    };

    u.onstart = () => {
      setDurum("oynatiliyor");
      baslangicZamani.current = Date.now();

      // Tahmini süre hesapla
      const kelimeSayisi = metin.split(/\s+/).length;
      const dakika = kelimeSayisi / (150 * hiz);
      setTahminiSure(dakika * 60);

      setDuyuru(`Sesli okuma başladı. Tahmini süre ${Math.ceil(dakika)} dakika.`);
    };

    u.onend = () => {
      setDurum("hazir");
      setIlerleme(100);
      setDuyuru("Sesli okuma tamamlandı.");

      if (articleId) {
        localStorage.removeItem(`sesli-oku-pozisyon-${articleId}`);
      }
    };

    u.onerror = () => {
      setDurum("hazir");
      setDuyuru("Sesli okuma sırasında bir hata oluştu.");
    };

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [getOkunacakMetin, hiz, tonlama, sesSecimi, mevcutSesler, articleId]);

  const duraklat = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setDurum("duraklatildi");
    setDuyuru("Sesli okuma duraklatıldı. Devam etmek için devam et butonuna basın.");
  }, []);

  const devam = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setDurum("oynatiliyor");
    setDuyuru("Sesli okuma devam ediyor.");
  }, []);

  const durdur = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setDurum("hazir");
    setIlerleme(0);
    setGecenSure(0);
    setDuyuru("Sesli okuma durduruldu.");
  }, []);

  // Klavye kısayolları (Görme engelliler için kritik!)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P: Oynat/Duraklat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        if (durum === "oynatiliyor") {
          duraklat();
        } else if (durum === "duraklatildi") {
          devam();
        } else {
          baslat();
        }
      }
      // Ctrl/Cmd + Shift + S: Durdur
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        durdur();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [durum, baslat, duraklat, devam, durdur]);

  // Focus management - ilk yüklemede odaklan
  useEffect(() => {
    if (controlerRef.current) {
      controlerRef.current.focus();
    }
  }, []);

  if (!destekleniyor) {
    return (
      <div
        className={`rounded-lg border-2 border-yellow-600 bg-yellow-50 p-6 ${className}`}
        role="alert"
        aria-live="polite"
      >
        <h3 className="text-lg font-bold text-yellow-900 mb-2">
          ⚠️ Sesli Okuma Desteklenmiyor
        </h3>
        <p className="text-sm text-yellow-800 leading-relaxed">
          Bu tarayıcı sesli okumayı desteklemiyor. Görme engelli kullanıcılar için alternatif olarak
          <strong> ekran okuyucu yazılımları</strong> kullanabilirsiniz:
        </p>
        <ul className="mt-3 list-disc list-inside text-sm text-yellow-800 space-y-1">
          <li><strong>NVDA</strong> (Windows, ücretsiz)</li>
          <li><strong>JAWS</strong> (Windows, ücretli)</li>
          <li><strong>VoiceOver</strong> (Mac/iOS, yerleşik)</li>
          <li><strong>TalkBack</strong> (Android, yerleşik)</li>
        </ul>
      </div>
    );
  }
  const oynatiliyor = durum === "oynatiliyor";
  const duraklatildi = durum === "duraklatildi";

  return (
    <div
      ref={controlerRef}
      className={`rounded-lg border border-border bg-muted-bg/50 p-3 ${className}`}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {/* Başlık - Kompakt */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <span aria-hidden className="text-base">♿</span>
          <span>Sesli Okuma</span>
        </h3>
      </div>

      {/* İlerleme - Sadece oynatılıyorsa göster */}
      {(oynatiliyor || duraklatildi) && ilerleme > 0 && (
        <div className="mb-2 p-2 rounded bg-background border border-border" aria-live="polite">
          <div className="flex justify-between items-center text-xs text-muted mb-1">
            <span>{formatSure(gecenSure)}</span>
            <span className="font-bold text-primary">{Math.floor(ilerleme)}%</span>
            <span>{formatSure(tahminiSure)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={Math.floor(ilerleme)} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${ilerleme}%` }}
            />
          </div>
        </div>
      )}

      {/* Kaldığınız Yerden - Kompakt */}
      {kaydedilmisPozisyon > 5 && durum === "hazir" && (
        <div className="mb-2 p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-500">
          <button
            onClick={() => baslat(true)}
            className="w-full text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            aria-label={`Yazının yüzde ${Math.floor(kaydedilmisPozisyon)} yerinden devam et`}
          >
            📖 Kaldığınız Yerden Devam (%{Math.floor(kaydedilmisPozisyon)})
          </button>
        </div>
      )}

      {/* Ana Butonlar - Kompakt */}
      <div className="flex flex-wrap gap-2">
        {durum === "hazir" && (
          <button
            type="button"
            onClick={() => baslat()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Yazıyı sesli oku (Ctrl+Shift+P)"
          >
            <span aria-hidden>🔊</span>
            Sesli Oku
          </button>
        )}

        {duraklatildi && (
          <>
            <button
              type="button"
              onClick={devam}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              aria-label="Devam et (Ctrl+Shift+P)"
            >
              <span aria-hidden>▶️</span>
              Devam Et
            </button>
            <button
              type="button"
              onClick={durdur}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-red-600 bg-background px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              aria-label="Durdur (Ctrl+Shift+S)"
            >
              <span aria-hidden>⏹</span>
              Durdur
            </button>
          </>
        )}

        {oynatiliyor && (
          <>
            <button
              type="button"
              onClick={duraklat}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded border-2 border-amber-600 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 text-sm font-medium text-amber-900 dark:text-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              aria-label="Duraklat (Ctrl+Shift+P)"
            >
              <span aria-hidden>⏸</span>
              Duraklat
            </button>
            <button
              type="button"
              onClick={durdur}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-red-600 bg-background px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              aria-label="Durdur (Ctrl+Shift+S)"
            >
              <span aria-hidden>⏹</span>
              Durdur
            </button>
          </>
        )}
      </div>

      {/* Screen Reader Duyuruları (Görünmez ama ekran okuyucu duyurur) */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {duyuru}
      </div>

      {/* Durum bildirimi (sürekli) */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="false">
        {oynatiliyor && "Yazı sesli okunuyor."}
        {duraklatildi && "Sesli okuma duraklatıldı."}
        {durum === "hazir" && ilerleme === 0 && "Sesli okuma hazır."}
        {durum === "hazir" && ilerleme === 100 && "Sesli okuma tamamlandı."}
      </div>
    </div>
  );
}
