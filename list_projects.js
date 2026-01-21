
const token = 'sbp_eea9d8f59f49aee19dd22064e74f4fe741d4c061';

async function listProjects() {
  try {
    const response = await fetch('https://api.supabase.com/v1/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const projects = await response.json();
    console.log("Projects found:");
    projects.forEach(p => {
      console.log(`- Name: ${p.name}, ID: ${p.id}, Status: ${p.status}`);
    });
  } catch (error) {
    console.error('Failed to list projects:', error);
  }
}

listProjects();
