export default function Loading() {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75"></div>
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-background ring-4 ring-primary/30">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                </div>
                <p className="animate-pulse font-serif text-lg font-medium text-muted-foreground">
                    Yükleniyor...
                </p>
            </div>
        </div>
    );
}
