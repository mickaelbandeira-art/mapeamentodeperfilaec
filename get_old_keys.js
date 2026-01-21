
const token = 'sbp_eea9d8f59f49aee19dd22064e74f4fe741d4c061';
const projectRef = 'zpoqtqfscxpozkdvlqoi'; // OLD Project

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
        console.log("Keys found for OLD PROJECT:");
        keys.forEach(k => {
            console.log(`- Name: ${k.name}, Key: ${k.api_key.substring(0, 10)}... (truncated)`);
            if (k.name === 'service_role') {
                console.log(`FULL_SERVICE_KEY: ${k.api_key}`);
            }
        });
    } catch (error) {
        console.error('Failed to get keys:', error);
    }
}

getProjectKeys();
