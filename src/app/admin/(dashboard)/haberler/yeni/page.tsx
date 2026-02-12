import { Suspense } from "react";
import { createHaber } from "@/app/admin/actions";
import { HaberForm } from "@/components/admin/HaberForm";
import Loading from "../../loading";

export default function YeniHaberPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Yeni Haber Ekle
                </h1>
                <p className="mt-1 text-sm text-muted">
                    Ana sayfa slider'ında görünecek yeni bir haber/manşet ekleyin.
                </p>
            </div>

            <Suspense fallback={<Loading />}>
                <HaberForm action={createHaber} />
            </Suspense>
        </div>
    );
}
