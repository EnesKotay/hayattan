import { createYazi } from '../../../../src/app/admin/actions';
import { prisma as prismaClient } from '../../../../src/lib/db';
import { auth } from '../../../../src/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prisma = prismaClient as unknown as DeepMockProxy<PrismaClient>;

// Mock dependencies
jest.mock('next-auth', () => ({
    __esModule: true,
    default: jest.fn(), // NextAuth(...)
    auth: jest.fn(), // Exported auth()
}));

// We must also mock src/lib/auth because actions.ts imports auth from there
jest.mock('../../../../src/lib/auth', () => ({
    auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}));

jest.mock('../../../../src/lib/sanitize', () => ({
    sanitizeHtml: jest.fn((str) => str),
    sanitizeText: jest.fn((str) => str),
    sanitizeUrl: jest.fn((str) => str),
}));

describe('Yazi Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default authorized mock
        (auth as jest.Mock).mockResolvedValue({
            user: { role: 'ADMIN' }
        });
    });

    describe('createYazi', () => {
        it('should throw error if not authorized', async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            const formData = new FormData();
            formData.append('title', 'Test');

            await expect(createYazi(formData)).rejects.toThrow('Yetkisiz erişim');
        });

        it('should create yazi and redirect', async () => {
            const formData = new FormData();
            formData.append('title', 'Test Title');
            formData.append('content', 'Test Content');
            formData.append('authorId', 'author1');

            // Expected slugify result for "Test Title" -> "test-title"
            // But we can check calls. 
            // Also need slug. If not provided, it generates from title.

            await createYazi(formData);

            expect(prisma.yazi.create).toHaveBeenCalled();
            expect(revalidatePath).toHaveBeenCalled();
            expect(redirect).toHaveBeenCalledWith('/admin/yazilar?success=1');
        });
    });
});
