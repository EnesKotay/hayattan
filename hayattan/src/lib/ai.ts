import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

/**
 * Yazı içeriğinden otomatik özet (excerpt) üretir.
 */
export async function generateExcerpt(content: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Aşağıdaki metinden, sosyal medya ve haber siteleri için ilgi çekici, maksimum 160 karakterlik bir özet (tanıtım yazısı) hazırla. Sadece özeti döndür, yorum yapma:
  
  ${content.substring(0, 4000)}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("AI Excerpt Error:", error);
        throw new Error("Özet üretilemedi. Lütfen API anahtarını kontrol edin.");
    }
}

/**
 * Yazı için Google SEO açıklaması (meta description) üretir.
 */
export async function generateMetaDescription(title: string, content: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Başlığı "${title}" olan aşağıdaki metin için Google arama sonuçlarında görünecek, tıklama oranını artıracak profesyonel bir meta açıklama yaz. Maksimum 150 karakter olsun. Sadece açıklamayı döndür:
  
  ${content.substring(0, 3000)}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("AI SEO Error:", error);
        throw new Error("SEO açıklaması üretilemedi.");
    }
}
