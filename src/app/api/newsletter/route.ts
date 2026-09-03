import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMailConfigured, sendNewsletterWelcomeEmail } from "@/lib/mail";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit(clientId, "newsletter");

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi giriniz." }, { status: 400 });
    }

    const existing = await (prisma as any).newsletterSubscriber.findUnique({ where: { email } });

    if (existing?.active) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
    }

    if (existing) {
      await (prisma as any).newsletterSubscriber.update({ where: { email }, data: { active: true } });
    } else {
      await (prisma as any).newsletterSubscriber.create({ data: { email } });
    }

    if (!isMailConfigured()) {
      return NextResponse.json({
        success: true,
        emailSent: false,
        warning: "Aboneliğiniz kaydedildi ancak e-posta servisi henüz yapılandırılmamış.",
      });
    }

    try {
      await sendNewsletterWelcomeEmail(email);
      return NextResponse.json({
        success: true,
        emailSent: true,
        message: "Aboneliğiniz tamamlandı. Hoş geldiniz e-postasını kontrol edin.",
      });
    } catch (mailError) {
      console.error("Newsletter welcome email failed:", mailError);
      return NextResponse.json({
        success: true,
        emailSent: false,
        warning: "Aboneliğiniz kaydedildi ancak hoş geldiniz e-postası gönderilemedi.",
      });
    }
  } catch (error) {
    console.error("Newsletter subscription failed:", error);
    return NextResponse.json({ error: "Bir hata oluştu. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
