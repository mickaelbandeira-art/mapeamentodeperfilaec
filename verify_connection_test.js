
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Manually parse .env because dotenv might not pick it up if not configured right in module mode without path
const envConfig = dotenv.parse(fs.readFileSync('.env'));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_PUBLISHABLE_KEY; // Using Anon key

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log(`Connecting to: ${supabaseUrl}`);

    // Try to select from a table we know exists (participants)
    const { data, error } = await supabase
        .from('participants')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Connection Failed or Table Missing:', error.message);
        if (error.code === '42P01') {
            console.error('   Running the SQL Migration manually is required!');
        }
    } else {
        console.log('✅ Connection Successful!');
        console.log(`   Table 'participants' exists. Row count: ${data === null ? 'Unknown' : 'Available (Head request)'}`);
    }
}

verify();
