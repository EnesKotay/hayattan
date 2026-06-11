import { Resend } from "resend";

const domain = process.env.NEXT_PUBLIC_APP_URL || "https://hayattan.net";

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const resetLink = `${domain}/admin/sifre-sifirla?token=${token}`;

    await resend.emails.send({
        from: "Hayattan.Net <noreply@hayattan.net>",
        to: email,
        subject: "Şifre Sıfırlama İsteği",
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #8D1C3D; text-align: center;">Hayattan.Net</h2>
        <p>Merhaba,</p>
        <p>Hesabınız için şifre sıfırlama isteğinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayabilirsiniz:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #8D1C3D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Şifremi Sıfırla</a>
        </div>
        <p>Bu bağlantı 1 saat boyunca geçerlidir. Eğer bu isteği siz yapmadıysanız, bu e-postayı dikkate almayabilirsiniz.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">Bu otomatik bir e-postadır, lütfen yanıtlamayınız.</p>
      </div>
    `,
    });
};
