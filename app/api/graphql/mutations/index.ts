import { generateSession, summarizeSessionLog } from "./ai";
import { createClient } from "./client";
import { createTrainingPlan, updateTrainingPlan } from "./trainingPlan";

export default {
  summarizeSessionLog,
  generateSession,
  createTrainingPlan,
  updateTrainingPlan,
  createClient,
};