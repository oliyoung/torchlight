import athleticsGoals from '../seeds/goals/athletics.json';
import baseballGoals from '../seeds/goals/baseball.json';
import basketballGoals from '../seeds/goals/basketball.json';
import cricketGoals from '../seeds/goals/cricket.json';
import footballGoals from '../seeds/goals/football.json';
import golfGoals from '../seeds/goals/golf.json';
import hockeyGoals from '../seeds/goals/hockey.json';
import rugbyGoals from '../seeds/goals/rugby.json';
import soccerGoals from '../seeds/goals/soccer.json';
import swimmingGoals from '../seeds/goals/swimming.json';
import tennisGoals from '../seeds/goals/tennis.json';
import volleyballGoals from '../seeds/goals/volleyball.json';

// Map of sport IDs to their goal titles
const goalsBySport: Record<string, string[]> = {
  basketball: basketballGoals,
  football: footballGoals,
  soccer: soccerGoals,
  baseball: baseballGoals,
  tennis: tennisGoals,
  golf: golfGoals,
  swimming: swimmingGoals,
  volleyball: volleyballGoals,
  hockey: hockeyGoals,
  cricket: cricketGoals,
  rugby: rugbyGoals,
  athletics: athleticsGoals,
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