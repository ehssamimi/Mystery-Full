/**
 * Pantomime Game Configuration
 * تنظیمات بازی پانتومیم
 */

export const PANTOMIME_CONFIG = {
  // Target score to win the game
  TARGET_SCORE: 60,
  
  // Time per player turn in seconds
  TURN_TIME_SECONDS: 30,
  
  // Maximum number of skips allowed per player
  MAX_SKIPS: 3,
  
  // Number of words per player
  WORDS_PER_PLAYER: 20,
} as const;

