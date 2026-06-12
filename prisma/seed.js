const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminStaffId = process.env.SUPERUSER_ID || 'UCHE0001'
  const adminPassword = process.env.SUPERUSER_PASSWORD || 'admin123'

  const existing = await prisma.user.findUnique({ where: { staffId: adminStaffId } })
  if (existing) {
    console.log('Superuser already exists')
    return
  }

  const hash = await bcrypt.hash(adminPassword, 10)
  await prisma.user.create({ data: { staffId: adminStaffId, fullName: 'Superuser', passwordHash: hash, role: 'superuser', active: true } })
  console.log('Superuser created', adminStaffId)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(() => prisma.$disconnect())
