// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function addDays(d, n)  { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

async function main() {
  const slots = []
  const base0 = startOfToday()
  for (let d = 0; d < 7; d++) {
    const base = addDays(base0, d)
    for (let m = 13 * 60; m <= 23 * 60 + 45; m += 15) {
      const dt = new Date(base); dt.setHours(Math.floor(m / 60), m % 60, 0, 0)
      slots.push({ startTime: dt, duration: 15 })
    }
  }
  for (const s of slots) {
    await prisma.slot.upsert({ where: { startTime: s.startTime }, update: {}, create: s })
  }
  console.log(`Seeded ${slots.length} slots`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(() => prisma.$disconnect())
