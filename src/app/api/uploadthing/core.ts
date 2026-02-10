import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

const authMiddleware = async () => {
    const session = await auth();
    if (!session?.user) throw new Error("Yetkisiz erişim");
    return { userId: session.user.id };
};

// File router: image, audio, video for articles
export const ourFileRouter = {
    articleImage: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
    })
        .middleware(authMiddleware)
        .onUploadComplete(async ({ metadata, file }) => {
            return { url: file.url };
        }),

    articleAudio: f({
        audio: { maxFileSize: "32MB", maxFileCount: 1 },
    })
        .middleware(authMiddleware)
        .onUploadComplete(async ({ file }) => {
            return { url: file.url };
        }),

    articleVideo: f({
        video: { maxFileSize: "128MB", maxFileCount: 1 },
    })
        .middleware(authMiddleware)
        .onUploadComplete(async ({ file }) => {
            return { url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
