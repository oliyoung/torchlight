// Basic goal templates by sport
const goalsBySport: Record<string, string[]> = {
  basketball: [
    "Improve free throw percentage",
    "Increase vertical jump",
    "Develop ball handling skills",
    "Enhance court vision",
    "Strengthen defensive positioning"
  ],
  football: [
    "Improve passing accuracy",
    "Increase sprint speed",
    "Develop route running",
    "Enhance tackling technique",
    "Build endurance"
  ],
  soccer: [
    "Improve first touch",
    "Increase shooting accuracy",
    "Develop crossing ability",
    "Enhance defensive positioning",
    "Build cardiovascular endurance"
  ],
  baseball: [
    "Improve batting average",
    "Increase throwing velocity",
    "Develop fielding technique",
    "Enhance base running",
    "Build arm strength"
  ],
  tennis: [
    "Improve serve consistency",
    "Develop backhand technique",
    "Enhance court movement",
    "Increase match endurance",
    "Strengthen mental game"
  ],
  golf: [
    "Improve driving accuracy",
    "Develop short game",
    "Enhance putting consistency",
    "Build course management",
    "Increase swing speed"
  ],
  swimming: [
    "Improve stroke technique",
    "Increase lap times",
    "Develop breathing rhythm",
    "Enhance starts and turns",
    "Build endurance"
  ],
  volleyball: [
    "Improve spike technique",
    "Develop serving consistency",
    "Enhance blocking skills",
    "Increase vertical jump",
    "Build team communication"
  ],
  hockey: [
    "Improve skating speed",
    "Develop stick handling",
    "Enhance shooting accuracy",
    "Build defensive positioning",
    "Increase game awareness"
  ],
  cricket: [
    "Improve batting technique",
    "Develop bowling accuracy",
    "Enhance fielding skills",
    "Build match concentration",
    "Increase fitness levels"
  ],
  rugby: [
    "Improve tackling technique",
    "Develop passing skills",
    "Enhance scrummaging",
    "Build match fitness",
    "Increase game awareness"
  ],
  athletics: [
    "Improve running form",
    "Increase speed/time",
    "Develop jumping technique",
    "Enhance throwing distance",
    "Build race strategy"
  ],
};

/**
 * Gets the available goal titles for a specific sport
 * @param sportId The ID of the sport
 * @returns Array of goal titles or empty array if sport not found
 */
export function getGoalTitlesBySport(sportId: string): string[] {
  return goalsBySport[sportId] || [];
}

/**
 * Gets all available sports that have goal titles
 * @returns Array of sport IDs
 */
export function getSportsWithGoals(): string[] {
  return Object.keys(goalsBySport);
}