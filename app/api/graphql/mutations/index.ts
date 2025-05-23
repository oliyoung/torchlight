import { generateSession } from "./ai/generateSessionPlan";
import { summarizeSessionLog } from "./ai/summarizeSessionLog";
import { createAthlete } from "./athletes/createAthlete";
import { createTrainingPlan } from "./training-plans/createTrainingPlan";
import { updateTrainingPlan } from "./training-plans/updateTrainingPlan";

export default {
  summarizeSessionLog,
  generateSession,
  createTrainingPlan,
  updateTrainingPlan,
  createAthlete,
};