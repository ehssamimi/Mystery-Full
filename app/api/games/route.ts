import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerCount = searchParams.get('players');

    let games = await prisma.game.findMany({
      where: {
        isActive: true, // فقط بازی‌های فعال را برگردان
      },
      include: {
        gameType: true, // شامل نوع بازی (playtype)
        datasets: true, // فقط برای گرفتن datasetIds
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Filter by player count if provided
    if (playerCount) {
      const count = parseInt(playerCount, 10);
      games = games.filter(
        (game) => game.minPlayers <= count && game.maxPlayers >= count
      );
    }

    // Transform response to match expected format
    const transformedGames = games.map((game) => ({
      id: game.id,
      name: game.name,
      nameEn: game.nameEn,
      description: game.description,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      category: game.category,
      rules: game.rules,
      tips: game.tips,
      difficulty: game.difficulty,
      duration: game.duration,
      materials: game.materials,
      imageUrl: game.imageUrl,
      isActive: game.isActive,
      score: game.score,
      // اضافه کردن gameType (playtype)
      playtype: game.gameType ? {
        id: game.gameType.id,
        nameFa: game.gameType.nameFa,
        nameEn: game.gameType.nameEn,
      } : null,
      gameType: game.gameType, // برای سازگاری با کدهای قدیمی
      // فقط ID های datasets را برگردان (نه اطلاعات کامل)
      datasetIds: game.datasets.map((gameDataset) => gameDataset.datasetId),
    }));

    return NextResponse.json(transformedGames || []);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      [],
      { status: 500 }
    );
  }
}

