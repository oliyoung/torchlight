import { generatePlan } from "@/lib/ai/generatePlan";
import { generateSession } from "@/lib/ai/generateSession";
import type { AiGenerateSessionInput, AiAnalyzeProgressInput, AiGeneratePlanInput, AiSummarizeSessionLogInput, Client, Goal, SessionLog } from "@/lib/types";
import type { GraphQLContext } from "../route";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/repository";

export default {
  createClient: async (_parent: unknown, args: { input: Partial<Client> }, context: GraphQLContext): Promise<Client> =>
    createClient(context?.user?.id ?? null, args.input),
}