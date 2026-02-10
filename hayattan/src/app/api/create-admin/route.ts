import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: "Email, password ve name gerekli"
      }, { status: 400 });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.yazar.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Bu email ile admin zaten mevcut"
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await prisma.yazar.create({
      data: {
        name,
        email,
        slug: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
        password: hashedPassword,
        biyografi: "Site Yöneticisi",
        misafir: false,
        ayrilmis: false,
        role: "ADMIN"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Admin kullanıcısı başarıyla oluşturuldu",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        slug: admin.slug
      }
    });

  } catch (error) {
    console.error("Admin oluşturma hatası:", error);
    
    return NextResponse.json({
      success: false,
      message: "Admin oluşturma başarısız",
      error: error instanceof Error ? error.message : "Bilinmeyen hata"
    }, { status: 500 });
  }
}