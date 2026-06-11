"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

interface SearchResult {
    id: string;
    title: string;
    slug: string;
    type: "yazi" | "kategori" | "yazar";
}

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();
    const { setTheme } = useTheme();
    const { data: session } = useSession();

    // Toggle with Ctrl+K or Cmd+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Debounced search
    React.useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data.results || []);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    const typeLabels = {
        yazi: "Yazı",
        kategori: "Kategori",
        yazar: "Yazar",
    };

    const typeIcons = {
        yazi: "📄",
        kategori: "📁",
        yazar: "✍️",
    };

    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "AUTHOR";

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        >
            <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
                <Command.Input
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Ne aramak istersiniz? (Yazı, yazar, komut...)"
                    className="w-full border-b border-gray-200 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-gray-500 dark:border-gray-800 dark:text-gray-50"
                />
                <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                    {isLoading && <div className="p-4 text-center text-sm text-gray-500">Aranıyor...</div>}

                    {!isLoading && query.length > 0 && results.length === 0 && (
                        <Command.Empty className="py-6 text-center text-sm text-gray-500">
                            Sonuç bulunamadı.
                        </Command.Empty>
                    )}

                    {results.length > 0 && (
                        <Command.Group heading="Arama Sonuçları" className="px-2 py-1.5 text-xs font-medium text-gray-500">
                            {results.map((result) => (
                                <Command.Item
                                    key={`${result.type}-${result.id}`}
                                    onSelect={() => {
                                        const prefix =
                                            result.type === "yazi"
                                                ? "/yazilar/"
                                                : result.type === "kategori"
                                                    ? "/kategoriler/"
                                                    : "/yazarlar/";
                                        runCommand(() => router.push(prefix + result.slug));
                                    }}
                                    className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
                                    value={result.title} // Adding value for fuzzy search if needed by cmdk filtering
                                >
                                    <span className="text-lg">{typeIcons[result.type]}</span>
                                    <div className="flex flex-col">
                                        <span>{result.title}</span>
                                        <span className="text-xs text-muted-foreground">{typeLabels[result.type]}</span>
                                    </div>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}

                    <Command.Group heading="Sayfalar" className="px-2 py-1.5 text-xs font-medium text-gray-500">
                        <Command.Item
                            onSelect={() => runCommand(() => router.push("/"))}
                            className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
                        >
                            <span>🏠</span> Ana Sayfa
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push("/yazilar"))}
                            className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
                        >
                            <span>📰</span> Yazılar
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push("/yazarlar"))}
                            className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
                        >
                            <span>👥</span> Yazarlar
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push("/iletisim"))}
                            className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
                        >
                            <span>📧</span> İletişim
                        </Command.Item>
                    </Command.Group>

                    {isAdmin && (
                        <Command.Group heading="Yönetim" className="px-2 py-1.5 text-xs font-medium text-gray-500">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/admin"))}
                                className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
                            >
                                <span>⚙️</span> Dashboard
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/admin/yazilar/yeni"))}
                                className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
                            >
                                <span>✏️</span> Yeni Yazı Ekle
                            </Command.Item>
                        </Command.Group>
                    )}

                    <Command.Group heading="Tema" className="px-2 py-1.5 text-xs font-medium text-gray-500">
                        <Command.Item
                            onSelect={() => runCommand(() => setTheme("light"))}
                            className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
                        >
                            <span>☀️</span> Açık Tema
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => setTheme("dark"))}
                            className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
                        >
                            <span>🌙</span> Koyu Tema
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => setTheme("system"))}
                            className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50"
                        >
                            <span>💻</span> Sistem Teması
                        </Command.Item>
                    </Command.Group>
                </Command.List>
            </div>
        </Command.Dialog>
    );
}
