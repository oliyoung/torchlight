import { analyzeProgress } from './ai/analyzeProgress';
import { generateSession } from "./ai/generateSessionPlan";
import { summarizeSessionLog } from "./ai/summarizeSessionLog";
import { createAthlete } from "./athletes/createAthlete";
import { createTrainingPlan } from "./training-plans/createTrainingPlan";
import { updateTrainingPlan } from "./training-plans/updateTrainingPlan";

export default {
  summarizeSessionLog,
  generateSession,
  analyzeProgress,
  createTrainingPlan,
  updateTrainingPlan,
  createAthlete,
};