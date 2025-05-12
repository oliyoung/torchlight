import { generatePlan } from './generatePlan';
import { Anthropic } from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ content: ['Generated training plan'] }),
    },
  })),
}));

// Mock fs and path
jest.mock('node:fs', () => ({
  readFileSync: jest.fn().mockReturnValue('Training program prompt'),
}));

jest.mock('node:path', () => ({
  join: jest.fn().mockReturnValue('/mock/path/to/training_program.md'),
}));

describe('generatePlan', () => {
  it('should generate a training plan', async () => {
    const input = {
      clientId: '1',
      goalIds: ['goal1', 'goal2'],
      sessionLogIds: ['log1', 'log2'],
    };

    const result = await generatePlan(input);

    expect(result).toBe('Generated training plan');
    expect(Anthropic).toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/to/training_program.md', 'utf-8');
  });

  it('should throw an error if client is not found', async () => {
    jest.spyOn(global, 'getClientById').mockResolvedValueOnce(null);

    const input = {
      clientId: 'invalid',
      goalIds: ['goal1'],
      sessionLogIds: ['log1'],
    };

    await expect(generatePlan(input)).rejects.toThrow('Client not found');
  });

  // Add more tests for other scenarios as needed
});