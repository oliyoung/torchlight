import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

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
        console.log('Database seeded successfully.');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await client.end();
    }
}

main();