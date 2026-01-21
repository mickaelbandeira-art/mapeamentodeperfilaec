
const token = 'sbp_eea9d8f59f49aee19dd22064e74f4fe741d4c061';
const projectRef = 'jxlvqsoudlcsbbntmtsr';
const newPassword = 'TempPassword123!@#'; // Temporary password for migration

async function resetPassword() {
    try {
        // Corrected endpoint: POST /projects/{ref}/database/password (Removed /config)
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: newPassword })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error: ${response.status} ${response.statusText} - ${text}`);
        }

        console.log("Password reset successfully.");
    } catch (error) {
        console.error('Failed to reset password:', error);
    }
}

resetPassword();
