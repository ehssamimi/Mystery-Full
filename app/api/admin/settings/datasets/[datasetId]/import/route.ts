import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Helper function برای چک کردن نقش ادمین
async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return { isAdmin: false, error: 'احراز هویت نشده‌اید' };
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return { isAdmin: false, error: 'Session منقضی شده است' };
  }

  if (session.user.role !== 'admin') {
    return { isAdmin: false, error: 'دسترسی محدود' };
  }

  return { isAdmin: true };
}

const importSchema = z.object({
  rows: z.array(z.record(z.any())),
  overwrite: z.boolean().optional().default(false),
});

// POST: Import DatasetItem‌ها از Excel (JSON تبدیل‌شده در کلاینت) با upsert بر اساس id
export async function POST(
  request: NextRequest,
  { params }: { params: { datasetId: string } }
) {
  try {
    const adminCheck = await checkAdmin(request);

    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 403 }
      );
    }

    const { datasetId } = params;

    // Verify dataset exists
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
    });

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset یافت نشد' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { rows, overwrite } = importSchema.parse(body);

    console.log(`Importing ${rows.length} rows for dataset ${datasetId}`);
    if (rows.length > 0) {
      console.log('First row keys:', Object.keys(rows[0]));
      console.log('First row sample:', rows[0]);
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: { rowIndex: number; message: string }[] = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      try {
        const rawId = row.id;
        // اگر id خالی بود، یک id جدید می‌سازیم
        let id: string;
        if (!rawId || !String(rawId).trim()) {
          id = randomUUID();
        } else {
          // تبدیل به string و trim کردن
          id = String(rawId).trim();
          // اگر عدد است، به string تبدیل می‌کنیم (مثلاً 42 -> "42")
          if (!isNaN(Number(rawId)) && Number(rawId) == rawId) {
            id = String(Number(rawId));
          }
        }
        
        console.log(`Processing row ${index + 2}, ID: ${id} (raw: ${rawId}, type: ${typeof rawId})`);

        // ساخت data برای Prisma با توجه به فیلدهای موجود
        const data: any = {};

        // پیدا کردن nameFa با نام‌های مختلف (case-insensitive و با فاصله)
        let nameFa: string | undefined;
        const nameFaKeys = ['nameFa', 'namefa', 'name_fa', 'name-fa', 'نام فارسی', 'نام', 'persian', 'fa'];
        for (const key of nameFaKeys) {
          if (row[key] !== undefined && row[key] !== null && String(row[key]).trim()) {
            nameFa = String(row[key]).trim();
            break;
          }
        }
        // اگر پیدا نشد، اولین ستون غیر id را به عنوان nameFa در نظر بگیر
        if (!nameFa) {
          const keys = Object.keys(row).filter(k => k.toLowerCase() !== 'id' && k.toLowerCase() !== 'nameen' && k.toLowerCase() !== 'name_en');
          if (keys.length > 0) {
            const firstValue = row[keys[0]];
            if (firstValue !== undefined && firstValue !== null && String(firstValue).trim()) {
              nameFa = String(firstValue).trim();
            }
          }
        }

        // پیدا کردن nameEn با نام‌های مختلف (case-insensitive و با فاصله)
        let nameEn: string | undefined;
        const nameEnKeys = ['nameEn', 'nameen', 'name_en', 'name-en', 'نام انگلیسی', 'english', 'en'];
        for (const key of nameEnKeys) {
          if (row[key] !== undefined && row[key] !== null && String(row[key]).trim()) {
            nameEn = String(row[key]).trim();
            break;
          }
        }
        // اگر پیدا نشد، دومین ستون غیر id را به عنوان nameEn در نظر بگیر
        if (!nameEn) {
          const keys = Object.keys(row).filter(k => k.toLowerCase() !== 'id' && k.toLowerCase() !== 'namefa' && k.toLowerCase() !== 'name_fa');
          if (keys.length > 1) {
            const secondValue = row[keys[1]];
            if (secondValue !== undefined && secondValue !== null && String(secondValue).trim()) {
              nameEn = String(secondValue).trim();
            }
          } else if (keys.length === 1 && nameFa) {
            // اگر فقط یک ستون داریم، همان را برای nameEn هم استفاده کنیم
            nameEn = nameFa;
          }
        }

        if (nameFa) {
          data.nameFa = nameFa;
        }

        if (nameEn) {
          data.nameEn = nameEn;
        }

        // برای create یا update، nameFa و nameEn الزامی هستند
        if (!data.nameFa || !data.nameEn) {
          const missingFields: string[] = [];
          if (!data.nameFa) missingFields.push('nameFa');
          if (!data.nameEn) missingFields.push('nameEn');
          errors.push({
            rowIndex: index + 2,
            message: `برای ایجاد/به‌روزرسانی، ${missingFields.join(' و ')} الزامی هستند. ستون‌های موجود: ${Object.keys(row).join(', ')}`,
          });
          console.error(`Row ${index + 2} missing fields:`, { missingFields, rowKeys: Object.keys(row), row });
          continue;
        }

        // چک کردن اینکه آیا رکورد با این ID وجود دارد
        const existing = await prisma.datasetItem.findUnique({
          where: { id },
        });

        if (existing) {
          // اگر رکورد وجود دارد
          if (overwrite) {
            // اگر overwrite فعال است، رکورد را update می‌کنیم
            console.log(`Overwriting existing item with ID: ${id}, old data:`, {
              oldNameFa: existing.nameFa,
              oldNameEn: existing.nameEn,
              oldDatasetId: existing.datasetId,
              newNameFa: data.nameFa,
              newNameEn: data.nameEn,
              newDatasetId: datasetId,
            });
            
            await prisma.datasetItem.update({
              where: { id },
              data: {
                datasetId, // datasetId را هم update می‌کنیم تا مطمئن شویم در dataset درست است
                nameFa: data.nameFa,
                nameEn: data.nameEn,
              },
            });
            updated++;
          } else {
            // اگر overwrite غیرفعال است، رکورد موجود را skip می‌کنیم
            console.log(`Skipping existing item with ID: ${id} (overwrite disabled)`);
            skipped++;
            // به errors اضافه نمی‌کنیم چون این یک skip عمدی است
          }
        } else {
          // رکورد وجود ندارد، ایجاد می‌کنیم
          try {
            await prisma.datasetItem.create({
              data: {
                id,
                datasetId,
                nameFa: data.nameFa,
                nameEn: data.nameEn,
              },
            });
            created++;
          } catch (createError: any) {
            // اگر create fail کرد به دلیل duplicate ID (که نباید اتفاق بیفتد چون چک کردیم)
            // یک ID جدید می‌سازیم
            if (createError?.code === 'P2002' && createError?.meta?.target?.includes('id')) {
              const newId = randomUUID();
              await prisma.datasetItem.create({
                data: {
                  id: newId,
                  datasetId,
                  nameFa: data.nameFa,
                  nameEn: data.nameEn,
                },
              });
              created++;
            } else {
              throw createError;
            }
          }
        }
      } catch (err) {
        console.error(`Import row ${index + 2} error:`, err);
        console.error('Row data:', row);
        const errorMessage = err instanceof Error ? err.message : 'خطا در پردازش این ردیف';
        errors.push({
          rowIndex: index + 2, // +2 برای در نظر گرفتن header و شروع از ردیف 2 در Excel
          message: errorMessage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      skipped: skipped + errors.length, // skipped شامل رکوردهای skip شده + خطاها
      errors,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Import dataset items error:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در Import آیتم‌های Dataset' },
      { status: 500 }
    );
  }
}

