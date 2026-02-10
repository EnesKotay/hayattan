import { PrismaClient } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'

const prisma = mockDeep<PrismaClient>()

export { prisma }
export default prisma
