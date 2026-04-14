import User from "@/models/User";
import XPTransaction from "@/models/XPTransaction";

const XP_VALUES = {
  SESSION_COMPLETE: 30,
  REVIEW_5STAR: 25,
  REVIEW_4STAR: 15,
  VERY_HELPFUL: 10,
  PROFILE_COMPLETE: 50,
  MOCK_TEST_PASS: 40,
  STREAK_BONUS: 20,
  FIRST_SESSION: 50,
  MILESTONE_10SESSIONS: 100,
  COMMUNITY_POST: 5,
  COMMUNITY_UPVOTE: 2,
  REFERRAL: 50,
};

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 900 },
  { level: 6, xp: 1400 },
  { level: 7, xp: 2000 },
  { level: 8, xp: 2800 },
  { level: 9, xp: 3800 },
  { level: 10, xp: 5000 },
];

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

export function getXPForNextLevel(currentLevel: number): number {
  const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === currentLevel + 1);
  return nextLevel ? nextLevel.xp : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].xp;
}

export async function awardXP(
  userId: string,
  amount: number,
  reason: string,
  source: string,
  sessionId?: string
) {
  try {
    // Create transaction record
    await XPTransaction.create({
      userId,
      amount,
      reason,
      source,
      sessionId,
    });

    // Update user's XP
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found for XP award`);
      return { success: false, error: "User not found" };
    }

    const oldLevel = user.level;
    user.xp += amount;
    const newLevel = calculateLevel(user.xp);

    let leveledUp = false;
    let unlockedProMentor = false;

    if (newLevel > oldLevel) {
      user.level = newLevel;
      leveledUp = true;

      // Check if reached Level 7 (Pro-Mentor eligibility)
      if (newLevel >= 7 && !user.canApplyForProMentor) {
        user.canApplyForProMentor = true;
        unlockedProMentor = true;
      }
    }

    await user.save();

    return {
      success: true,
      data: {
        xpEarned: amount,
        totalXP: user.xp,
        oldLevel,
        newLevel,
        leveledUp,
        unlockedProMentor,
      },
    };
  } catch (error: any) {
    console.error("Award XP error:", error);
    return { success: false, error: error.message };
  }
}

export function getLevelColor(level: number): string {
  if (level <= 3) return "gray";
  if (level <= 6) return "blue";
  return "gold";
}

export function getLevelName(level: number): string {
  const names: { [key: number]: string } = {
    1: "Newcomer",
    2: "Helper",
    3: "Guide",
    4: "Advisor",
    5: "Mentor",
    6: "Expert",
    7: "Master",
    8: "Champion",
    9: "Elite",
    10: "Legend",
  };
  return names[level] || "Unknown";
}

export { XP_VALUES };
