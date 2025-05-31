import analyzeSessionPatterns from './ai/analyzeSessionPatterns';
import extractAndEvaluateGoal from './ai/extractAndEvaluateGoal';
import generateTrainingPlan from './ai/generateTrainingPlan';
import summarizeSessionLog from "./ai/summarizeSessionLog";

import { createAthlete } from "./athletes/createAthlete";
import { createTrainingPlan } from "./training-plans/createTrainingPlan";
import { updateTrainingPlan } from "./training-plans/updateTrainingPlan";

export default {
  analyzeSessionPatterns,
  createAthlete,
  createTrainingPlan,
  extractAndEvaluateGoal,
  summarizeSessionLog,
  generateTrainingPlan,
  updateTrainingPlan
};