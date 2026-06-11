import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi giriniz." }, { status: 400 });
    }

    const existing = await (prisma as any).newsletterSubscriber.findUnique({ where: { email } });

    if (existing) {
      if (existing.active) {
        return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
      }
      await (prisma as any).newsletterSubscriber.update({ where: { email }, data: { active: true } });
      return NextResponse.json({ success: true });
    }

    await (prisma as any).newsletterSubscriber.create({ data: { email } });

    // Send welcome email if Resend is configured (non-blocking)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: "Hayattan.Net <noreply@hayattan.net>",
          to: email,
          subject: "Hayattan.Net Bültenine Hoş Geldiniz!",
          html: `<p>Merhaba,</p><p>Hayattan.Net bültenine abone olduğunuz için teşekkürler. En yeni yazılarımızdan haberdar olacaksınız.</p><p><a href="https://hayattan.net">Hayattan.Net</a></p>`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bir hata oluştu. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
