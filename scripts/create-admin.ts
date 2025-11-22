import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phone = '09112561701';

  console.log(`🔧 Creating/updating admin user for ${phone}...`);

  // پیدا کردن یا ایجاد کاربر
  let user = await prisma.user.findUnique({
    where: { phone },
  });

  if (user) {
    // اگر کاربر وجود دارد، نقشش را به admin تغییر بده
    user = await prisma.user.update({
      where: { phone },
      data: { role: 'admin' },
    });
    console.log(`✅ User ${phone} updated to admin role`);
  } else {
    // اگر کاربر وجود ندارد، ایجاد کن
    user = await prisma.user.create({
      data: {
        phone,
        role: 'admin',
      },
    });
    console.log(`✅ Admin user ${phone} created successfully`);
  }

  console.log(`\n📋 User Details:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Phone: ${user.phone}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Created: ${user.createdAt}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

