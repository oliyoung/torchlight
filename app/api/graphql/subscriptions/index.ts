import type { SessionLog, Goal, Athlete } from "@/lib/types";
import { trainingPlanSubscriptions } from "./training-plans";

export default {
  // Remove placeholder for trainingPlanGenerated
  // trainingPlanGenerated: {
  //   subscribe: (): AsyncIterator<TrainingPlan> => {
  //     // Logic for subscription
  //     return {} as AsyncIterator<TrainingPlan>;
  //   },
  // },
  sessionLogAdded: {
    subscribe: (): AsyncIterator<SessionLog> => {
      // Logic for subscription
      return {} as AsyncIterator<SessionLog>;
    },
  },
  goalAdded: {
    subscribe: (): AsyncIterator<Goal> => {
      // Logic for subscription
      return {} as AsyncIterator<Goal>;
    },
  },
  sessionLogUpdated: {
    subscribe: (): AsyncIterator<SessionLog> => {
      // Logic for subscription
      return {} as AsyncIterator<SessionLog>;
    },
  },
  goalUpdated: {
    subscribe: (): AsyncIterator<Goal> => {
      // Logic for subscription
      return {} as AsyncIterator<Goal>;
    },
  },
  athleteUpdated: {
    subscribe: (): AsyncIterator<Athlete> => {
      // Logic for subscription
      return {} as AsyncIterator<Athlete>;
    },
  },
  ...trainingPlanSubscriptions, // Spread the actual training plan subscriptions
}