import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim | Hayattan.Net",
  description: "Hayattan.Net ile iletişime geçin",
};

export default function IletisimPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        İletişim
      </h1>
      <div className="mt-8 space-y-6 text-muted">
        <p>
          Hayattan.Net ile iletişime geçmek için aşağıdaki kanalları
          kullanabilirsiniz.
        </p>
        <div className="rounded-lg border border-border bg-muted-bg/30 p-6">
          <h2 className="font-serif text-lg font-bold text-foreground">
            Sosyal Medya
          </h2>
          <ul className="mt-4 space-y-2">
            <li>
              <a
                href="https://www.facebook.com/Hayattan.Net2020"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/HayattanNet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Twitter
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/hayattannet/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/channel/UCO44ksBz7R6TYV7fCA6u0Gw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
