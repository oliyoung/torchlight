import type { SessionLog, Goal, TrainingPlan, Athlete } from "@/lib/types";

export default {
  trainingPlanGenerated: {
    subscribe: (): AsyncIterator<TrainingPlan> => {
      // Logic for subscription
      return {} as AsyncIterator<TrainingPlan>;
    },
  },
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
}