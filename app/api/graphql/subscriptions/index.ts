import type { SessionLog, Goal, Client } from "@/lib/types";

export default {
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
  clientUpdated: {
    subscribe: (): AsyncIterator<Client> => {
      // Logic for subscription
      return {} as AsyncIterator<Client>;
    },
  },
}