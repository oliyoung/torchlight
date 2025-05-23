import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import dotenv from 'dotenv';
import { logger } from '../lib/logger';

dotenv.config({ path: join(__dirname, '../.env') });

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set in .env');
    }

    const client = new Client({ connectionString });
    await client.connect();

    const sql = readFileSync(join(__dirname, '../fixtures.sql'), 'utf-8');
    try {
        await client.query(sql);
        logger.info('Database seeded successfully.');
    } catch (err) {
        logger.error({ err }, 'Error seeding database');
    } finally {
        await client.end();
    }
}

main();