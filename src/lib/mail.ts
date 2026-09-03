import { Resend } from "resend";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hayattan.net";
const fromEmail = process.env.RESEND_FROM_EMAIL || "Hayattan.Net <noreply@hayattan.net>";

function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("E-posta servisi yapılandırılmamış. RESEND_API_KEY eksik.");
    }
    return new Resend(apiKey);
}

async function sendEmail(payload: Parameters<Resend["emails"]["send"]>[0]) {
    const resend = getResendClient();
    const { error } = await resend.emails.send(payload);
    if (error) throw new Error(error.message);
}

export function isMailConfigured() {
    return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = siteUrl + "/admin/giris/sifre-sifirla?token=" + encodeURIComponent(token);

    await sendEmail({
        from: fromEmail,
        to: email,
        subject: "Şifre Sıfırlama İsteği",
        html: [
            '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">',
            '<h2 style="color: #8D1C3D; text-align: center;">Hayattan.Net</h2>',
            "<p>Merhaba,</p>",
            "<p>Hesabınız için şifre sıfırlama isteğinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayabilirsiniz:</p>",
            '<div style="text-align: center; margin: 30px 0;">',
            '<a href="' + resetLink + '" style="background-color: #8D1C3D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Şifremi Sıfırla</a>',
            "</div>",
            "<p>Bu bağlantı 1 saat boyunca geçerlidir. Eğer bu isteği siz yapmadıysanız, bu e-postayı dikkate almayabilirsiniz.</p>",
            '<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">',
            '<p style="font-size: 12px; color: #777; text-align: center;">Bu otomatik bir e-postadır, lütfen yanıtlamayınız.</p>',
            "</div>",
        ].join(""),
    });
};

export const sendNewsletterWelcomeEmail = async (email: string) => {
    await sendEmail({
        from: fromEmail,
        to: email,
        subject: "Hayattan.Net bültenine hoş geldiniz",
        html: [
            '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #252525;">',
            '<div style="border-bottom: 3px solid #8D1C3D; padding-bottom: 18px; margin-bottom: 24px;">',
            '<h1 style="color: #8D1C3D; font-size: 28px; margin: 0;">Hayattan.Net</h1>',
            "</div>",
            '<h2 style="font-size: 22px; margin: 0 0 16px;">Bültenimize hoş geldiniz</h2>',
            '<p style="font-size: 16px; line-height: 1.7; margin: 0 0 16px;">',
            "Aboneliğiniz başarıyla tamamlandı. Yeni yazılarımız ve güncel içeriklerimiz yayınlandığında sizi haberdar edeceğiz.",
            "</p>",
            '<div style="margin: 28px 0;">',
            '<a href="' + siteUrl + '" style="display: inline-block; background: #8D1C3D; color: #ffffff; padding: 12px 22px; border-radius: 7px; text-decoration: none; font-weight: 700;">Hayattan.Net&#39;i ziyaret et</a>',
            "</div>",
            '<p style="border-top: 1px solid #eeeeee; padding-top: 18px; color: #777777; font-size: 12px;">',
            "Bu e-posta Hayattan.Net bültenine abone olduğunuz için gönderildi.",
            "</p>",
            "</div>",
        ].join(""),
    });
};
