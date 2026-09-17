import "server-only";

import {
  prisma,
  runInBatches,
} from "@/backend/infrastructure/database/db";

/**
 * Route katmanının ORM kurulumuna doğrudan bağlanmasını engelleyen veri erişim
 * kapısı. Domain sorguları olgunlaştıkça bu kapının arkasındaki özel query ve
 * repository fonksiyonlarına taşınabilir; Prisma yaşam döngüsü ise burada kalır.
 */
export const repository = prisma;

export { runInBatches };
