import Link from "next/link";
import { repository } from "@/backend/modules/data/repository";
import { emptyReaderCounts, parseReaderCounts, READER_EVENTS, READER_PREFIX } from "@/shared/engagement/reader-metrics";

export async function ReaderMetrics() {
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - 29);
  const lower = `${READER_PREFIX}${from.toISOString().slice(0, 10)}:`;
  const upper = `${READER_PREFIX}${new Date().toISOString().slice(0, 10)}:~`;
  const rows = await repository.siteSetting.findMany({ where: { key: { startsWith: READER_PREFIX, gte: lower, lte: upper } }, select: { key: true, value: true } });
  const totals = emptyReaderCounts();
  const articles = new Map<string, ReturnType<typeof emptyReaderCounts>>();
  for (const row of rows) {
    const id = row.key.slice(READER_PREFIX.length + 11);
    const counts = parseReaderCounts(row.value);
    const article = articles.get(id) ?? emptyReaderCounts();
    for (const event of READER_EVENTS) { totals[event] += counts[event]; article[event] += counts[event]; }
    articles.set(id, article);
  }
  const ranked = [...articles.entries()].sort((a, b) => b[1].start - a[1].start).slice(0, 20);
  const posts = await repository.yazi.findMany({ where: { id: { in: ranked.map(([id]) => id) } }, select: { id: true, title: true, slug: true } });
  const rate = (numerator: number, denominator: number) => denominator > 0 ? `%${(numerator / denominator * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}` : "—";
  return (
    <section className="space-y-5 rounded-2xl border border-border bg-background p-5" aria-labelledby="reader-metrics-title">
      <div>
        <h2 id="reader-metrics-title" className="text-2xl font-bold">Okur davranışı · Son 30 gün</h2>
        <p className="mt-2 text-sm text-muted">Yeni ölçümün etkin olduğu ziyaretlerden hesaplanır; geçmiş görüntülenmeler bu oranlara dahil edilmez. Günler UTC esaslıdır.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Ölçülen ziyaret", String(totals.start)],
          ["Tahmini tamamlanma", rate(totals.complete, totals.start)],
          ["Konu önerisine geçiş", rate(totals.topic_click, totals.topic_view)],
          ["Yazar önerisine geçiş", rate(totals.author_click, totals.author_view)],
        ].map(([label, value]) => <div key={label} className="rounded-xl bg-muted-bg p-4"><p className="text-sm text-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}
      </div>
      <div>
        <h3 className="font-semibold">Okuma ilerlemesi</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-4">
          {[["%25'e ulaşan", totals.depth25], ["%50'ye ulaşan", totals.depth50], ["%75'e ulaşan", totals.depth75], ["Tamamlayan", totals.complete]].map(([label, count]) => <li key={label} className="rounded-lg border border-border p-3 text-sm">{label}: <strong>{count}</strong></li>)}
        </ul>
      </div>
      <p className="text-sm leading-relaxed text-muted">Tamamlanma, metnin en az %95’ine ulaşılması ve yazı görünürken uzunluğuna göre 10–60 saniye geçirilmesiyle tahmin edilir. İlerleme farkları okurların nerede azaldığını gösterir; kesin okuma veya çıkış kanıtı değildir. Öneri oranı, grubu gören ölçülen ziyaretlerden o gruba tıklayanların oranıdır. Aynı yazı ve olay sekme oturumunda bir kez sayılır; kişisel profil ve arama metni saklanmaz.</p>
      {ranked.length === 0 ? <p className="rounded-xl bg-muted-bg p-4 text-sm">Henüz ölçüm yok. Okurlar yazıları ziyaret ettikçe veriler burada görünecek.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">En çok ölçülen 20 yazının okuma ve öneri performansı</caption>
            <thead><tr>{["Yazı", "Ziyaret", "Tamamlanma", "Konu geçişi", "Yazar geçişi"].map(label => <th scope="col" key={label} className="p-3">{label}</th>)}</tr></thead>
            <tbody>{ranked.map(([id, counts]) => {
              const post = posts.find(post => post.id === id);
              return <tr key={id} className="border-t border-border"><td className="min-w-52 p-3">{post ? <Link className="text-primary hover:underline" href={`/yazilar/${post.slug}`}>{post.title}</Link> : "Silinmiş yazı"}</td><td className="p-3">{counts.start}</td><td className="p-3">{rate(counts.complete, counts.start)}</td><td className="p-3">{rate(counts.topic_click, counts.topic_view)}</td><td className="p-3">{rate(counts.author_click, counts.author_view)}</td></tr>;
            })}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
