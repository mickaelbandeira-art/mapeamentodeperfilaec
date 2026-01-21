
import fs from 'fs';
import path from 'path';

const migrationsDir = './supabase/migrations';
const seedFile = './supabase/seed.sql';
const outputFile = './supabase/FULL_MIGRATION.sql';

function concatMigrations() {
    try {
        const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
        files.sort(); // Sort by filename (timestamp)

        let content = '-- FULL MIGRATION SCRIPT\n-- Generated automatically\n\n';

        // 1. Appending Migrations
        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            content += `-- ========================\n-- MIGRATION: ${file}\n-- ========================\n`;
            content += fileContent + '\n\n';
        }

        // 2. Appending Seed
        if (fs.existsSync(seedFile)) {
            const seedContent = fs.readFileSync(seedFile, 'utf8');
            content += `-- ========================\n-- SEED DATA\n-- ========================\n`;
            content += seedContent + '\n';
        }

        fs.writeFileSync(outputFile, content);
        console.log(`Created ${outputFile} with ${files.length} migrations and seed data.`);
    } catch (error) {
        console.error('Failed to concat migrations:', error);
    }
}

concatMigrations();
