import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerCount = searchParams.get('players');

    let games = await prisma.game.findMany({
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

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

