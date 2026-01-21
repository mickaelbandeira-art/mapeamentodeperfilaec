
const token = 'sbp_eea9d8f59f49aee19dd22064e74f4fe741d4c061';
const projectRef = 'jxlvqsoudlcsbbntmtsr';

async function getProjectKeys() {
    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/api-keys`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const keys = await response.json();
        console.log("---KEYS_START---");
        keys.forEach(k => {
            console.log(`NAME: ${k.name}`);
            console.log(`KEY: ${k.api_key}`);
            console.log("---");
        });
        console.log("---KEYS_END---");
    } catch (error) {
        console.error('Failed to get keys:', error);
    }
}

getProjectKeys();
