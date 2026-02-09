import { prisma } from './src/lib/db'
import { mockReset } from 'jest-mock-extended'

jest.mock('./src/lib/db')

beforeEach(() => {
    mockReset(prisma)
})
