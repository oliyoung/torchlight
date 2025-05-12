// app/api/graphql/generatePlan.ts

import { Anthropic } from '@anthropic-ai/sdk'; // Import the Anthropic SDK
import type { AiGeneratePlanInput } from '../types'; // Adjust the import path as necessary

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generatePlan(input: AiGeneratePlanInput): Promise<string> {
  // const { clientId, goalIds, sessionLogIds } = input;

  // // Fetch client data
  // const client = await getClientById(clientId);
  // if (!client) {
  //   throw new Error('Client not found');
  // }

  // // Fetch goals
  // const goals: Goal[] = await getGoalsByIds(goalIds);
  // if (goals.length === 0) {
  //   throw new Error('No goals found');
  // }

  // // Fetch session logs
  // const sessionLogs: SessionLog[] = await getSessionLogsByIds(sessionLogIds);
  // if (sessionLogs.length === 0) {
  //   throw new Error('No session logs found');
  // }

  // // Load the training program prompt
  // const promptPath = path.join(__dirname, './prompts/training_plan.md');
  // const prompt = fs.readFileSync(promptPath, 'utf-8');

  // // Prepare the input for the AI model
  // const aiInput = {
  //   athleteProfile: {
  //     age: calculateAge(client.birthday),
  //     gender: client.gender,
  //     fitnessLevel: client.fitnessLevel,
  //     trainingHistory: client.trainingHistory,
  //     height: client.height,
  //     weight: client.weight,
  //     tags: client.tags,
  //     notes: client.notes,
  //   },
  //   goalsAndObjectives: {
  //     primaryGoals: goals.filter(goal => goal.status === 'ACTIVE').map(goal => ({
  //       title: goal.title,
  //       description: goal.description,
  //       dueDate: goal.dueDate,
  //     })),
  //   },
  //   historicalContext: {
  //     previousSessionLogs: sessionLogs.map(log => ({
  //       notes: log.notes,
  //       transcript: log.transcript,
  //       summary: log.summary,
  //       actionItems: log.actionItems,
  //     })),
  //     progressNotes: goals.map(goal => goal.progressNotes),
  //   },
  // };

  // // Call the Anthropic AI model
  // const response = await anthropic.messages.create({
  //   max_tokens: 1000,
  //   temperature: 0.7,
  //   model: 'claude-3-5-sonnet-20240620',
  //   messages: [{
  //     role: 'user',
  //     content: `${prompt}\n\n${JSON.stringify(aiInput)}`
  //   }],
  // });

  return String('')
}

