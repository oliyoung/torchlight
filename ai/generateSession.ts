// app/api/graphql/generatePlan.ts

import { Anthropic } from '@anthropic-ai/sdk'; // Import the Anthropic SDK
import fs from 'node:fs';
import path from 'node:path';
import type { Athlete, Goal, SessionLog, AiGenerateSessionInput } from '../types'; // Adjust the import path as necessary
import { athleteRepository, goalRepository, sessionLogRepository } from '@/lib/repository';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateSession(userId: string | null, input: AiGenerateSessionInput): Promise<string> {
  const { athleteId, goalIds, sessionLogIds } = input;

  // // Fetch athlete data
  const athlete = await athleteRepository.getAthleteById(userId, athleteId);
  if (!athlete) {
    throw new Error('Athlete not found');
  }

  // // Fetch goals
  const goals: Goal[] = await goalRepository.getGoalsByIds(userId, goalIds);
  if (goals.length === 0) {
    throw new Error('No goals found');
  }

  // // Fetch session logs
  const sessionLogs: SessionLog[] = await sessionLogRepository.getSessionLogsByIds(userId, sessionLogIds);
  if (sessionLogs.length === 0) {
    throw new Error('No session logs found');
  }

  // // Load the training program prompt
  const promptPath = path.join(__dirname, './prompts/session_plan.md');
  const prompt = fs.readFileSync(promptPath, 'utf-8');

  // // Prepare the input for the AI model
  const aiInput = {
    athlete,
    goals,
    sessionLogs
  };

  // // Call the Anthropic AI model
  const response = await anthropic.messages.create({
    max_tokens: 1000,
    temperature: 0.7,
    model: 'claude-3-5-sonnet-20240620',
    messages: [{
      role: 'user',
      content: `${prompt}\n\n${JSON.stringify(aiInput)}`
    }],
  });

  return String(response.content[0]);
}

