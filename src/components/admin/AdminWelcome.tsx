"use client";

import { useEffect, useState } from "react";
import { useToast } from "./ToastProvider";
import { useSession } from "next-auth/react";

export function AdminWelcome() {
    const { success } = useToast();
    const { data: session } = useSession();
    const [shown, setShown] = useState(false);

    useEffect(() => {
        if (session?.user && !shown) {
            const userName = session.user.name || session.user.email?.split("@")[0] || "Yönetici";
            success(`Hoş Geldiniz, ${userName}!`, "Hayattan.Net yönetim paneline başarıyla giriş yaptınız.");
            setShown(true);
        }
    }, [session, success, shown]);

    return null;
}
