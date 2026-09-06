const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function migrate() {
    const client = new Client({
        host: 'aws-0-us-east-2.pooler.supabase.com',
        port: 6543,
        user: 'postgres.cthmkcnynflcjkcluwwr',
        password: 'Let$getthisbread2501!',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    console.log('Connecting to Supabase PostgreSQL...');
    try {
        await client.connect();
        console.log('Connected successfully.');

        const sqlPath = path.join(__dirname, '..', 'data', 'supabase-schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing schema migration...');
        await client.query(sql);
        console.log('Schema executed successfully!');

        // Verify tables
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log('Public tables in Supabase:');
        res.rows.forEach(r => console.log(' - ' + r.table_name));

        await client.end();
        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
