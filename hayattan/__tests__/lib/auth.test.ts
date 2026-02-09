import { authConfig } from '../../src/lib/auth';
import { prisma as prismaClient } from '../../src/lib/db';
import { compare } from 'bcryptjs';
import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prisma = prismaClient as unknown as DeepMockProxy<PrismaClient>;

// Mock next-auth and credentials provider to avoid ESM issues
jest.mock('next-auth', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        handlers: { GET: jest.fn(), POST: jest.fn() },
        signIn: jest.fn(),
        signOut: jest.fn(),
        auth: jest.fn(),
    })),
}));

jest.mock('next-auth/providers/credentials', () => ({
    __esModule: true,
    default: jest.fn((config) => config),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
}));

// Mock rate-limit
jest.mock('../../src/lib/rate-limit', () => ({
    getClientIdentifier: jest.fn().mockReturnValue('mock-client-id'),
    resetRateLimit: jest.fn(),
}));

// Mock security-logger
jest.mock('../../src/lib/security-logger', () => ({
    logFailedLogin: jest.fn(),
    logSuccessfulLogin: jest.fn(),
}));

describe('Auth Configuration', () => {
    const authorize = authConfig.providers[0].authorize;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return null if missing credentials', async () => {
        const result = await authorize({}, { headers: new Headers() } as unknown as Request);
        expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const result = await authorize(
            { email: 'test@example.com', password: 'password' },
            { headers: new Headers() } as unknown as Request
        );

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: 'test@example.com' },
        });
        expect(result).toBeNull();
    });

    it('should return null if password invalid', async () => {
        const mockUser = {
            id: '1',
            email: 'test@example.com',
            passwordHash: 'hashed-password',
            name: 'Test',
            role: 'ADMIN',
        };
        // Use unknown cast to avoid partial match issues with Prisma User type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prisma.user.findUnique.mockResolvedValue(mockUser as unknown as any);
        (compare as jest.Mock).mockResolvedValue(false);

        const result = await authorize(
            { email: 'test@example.com', password: 'wrong' },
            { headers: new Headers() } as unknown as Request
        );

        expect(compare).toHaveBeenCalledWith('wrong', 'hashed-password');
        expect(result).toBeNull();
    });

    it('should return user if credentials valid', async () => {
        const mockUser = {
            id: '1',
            email: 'test@example.com',
            passwordHash: 'hashed-password',
            name: 'Test',
            role: 'ADMIN',
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prisma.user.findUnique.mockResolvedValue(mockUser as unknown as any);
        (compare as jest.Mock).mockResolvedValue(true);

        const result = await authorize(
            { email: 'test@example.com', password: 'correct' },
            { headers: new Headers() } as unknown as Request
        );

        expect(result).toEqual({
            id: '1',
            email: 'test@example.com',
            name: 'Test',
            role: 'ADMIN',
        });
    });
});
