import analyzeSessionPatterns from './ai/analyzeSessionPatterns';
import extractAndEvaluateGoal from './ai/extractAndEvaluateGoal';
import generateTrainingPlan from './ai/generateTrainingPlan';
import summarizeSessionLog from "./ai/summarizeSessionLog";

import { createCoach } from "./coaches/createCoach";
import { updateCoach } from "./coaches/updateCoach";
import { updateCoachBilling } from "./coaches/updateCoachBilling";
import { createAthlete } from "./athletes/createAthlete";
import { updateAthlete } from "./athletes/updateAthlete";
import { deleteAthlete } from "./athletes/deleteAthlete";
import { createGoal } from "./goals/createGoal";
import { updateGoal } from "./goals/updateGoal";
import { deleteGoal } from "./goals/deleteGoal";
import { createTrainingPlan } from "./training-plans/createTrainingPlan";
import { updateTrainingPlan } from "./training-plans/updateTrainingPlan";
import { createSessionLog } from "./session-logs/createSessionLog";
import { updateSessionLog } from "./session-logs/updateSessionLog";
import { deleteSessionLog } from "./session-logs/deleteSessionLog";

export default {
  analyzeSessionPatterns,
  createCoach,
  updateCoach,
  updateCoachBilling,
  createAthlete,
  updateAthlete,
  deleteAthlete,
  createGoal,
  updateGoal,
  deleteGoal,
  createSessionLog,
  updateSessionLog,
  deleteSessionLog,
  createTrainingPlan,
  extractAndEvaluateGoal,
  summarizeSessionLog,
  generateTrainingPlan,
  updateTrainingPlan
};