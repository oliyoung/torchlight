import { generateSession, summarizeSessionLog } from "./ai";
import { createAthlete } from "./athlete";
import { createTrainingPlan, updateTrainingPlan } from "./trainingPlan";

export default {
  summarizeSessionLog,
  generateSession,
  createTrainingPlan,
  updateTrainingPlan,
  createAthlete,
};