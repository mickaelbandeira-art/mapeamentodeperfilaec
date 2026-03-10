import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-aec-key';

app.use(cors());
app.use(express.json());

// Database connection
const { Pool } = pg;
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'db',
    database: process.env.DB_NAME || 'aec_mapeamento',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Auth Middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- AUTH ROUTES ---

app.post('/api/auth/login', async (req, res) => {
    const { email, password, site } = req.body;
    try {
        const result = await pool.query('SELECT u.*, p.status, p.role, p.site as allowed_sites FROM public.users u JOIN public.profiles p ON u.id = p.id WHERE u.email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        if (user.status !== 'approved') {
            return res.status(403).json({ error: user.status === 'pending' ? 'Acesso em análise' : 'Acesso negado' });
        }

        if (user.role !== 'admin' && user.allowed_sites && site) {
            const allowed = user.allowed_sites.split(',').map(s => s.trim().toUpperCase());
            if (!allowed.includes(site.toUpperCase())) {
                return res.status(403).json({ error: `Sua conta não tem permissão para a praça ${site}` });
            }
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { email, password, full_name, matricula } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        const userResult = await pool.query(
            'INSERT INTO public.users (email, password_hash) VALUES ($1, $2) RETURNING id',
            [email, hashed]
        );
        const userId = userResult.rows[0].id;

        await pool.query(
            'INSERT INTO public.profiles (id, full_name, email, matricula, status) VALUES ($1, $2, $3, $4, $5)',
            [userId, full_name, email, matricula, 'pending']
        );

        res.json({ message: 'User registered, awaiting approval' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const profileResult = await pool.query('SELECT * FROM public.profiles WHERE id = $1', [req.user.id]);
        const roleResult = await pool.query('SELECT role FROM public.user_roles WHERE user_id = $1', [req.user.id]);

        res.json({
            user: req.user,
            profile: profileResult.rows[0],
            roles: roleResult.rows.map(r => r.role)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/pending-count', authenticate, async (req, res) => {
    try {
        const result = await pool.query("SELECT COUNT(*) FROM public.profiles WHERE status = 'pending'");
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DASHBOARD ROUTES ---

app.get('/api/stats', authenticate, async (req, res) => {
    const { site, start, end } = req.query;
    try {
        let query = `
      SELECT 
        (SELECT COUNT(*) FROM participants WHERE is_active = true ${site ? "AND site = $1" : ""}) as total_participants,
        (SELECT COUNT(*) FROM test_results tr JOIN participants p ON tr.registration = p.registration 
         WHERE p.is_active = true ${site ? "AND p.site = $1" : ""} 
         ${start ? "AND tr.completed_at >= " + (site ? "$2" : "$1") : ""}
         ${end ? "AND tr.completed_at <= " + (site ? (start ? "$3" : "$2") : (start ? "$2" : "$1")) : ""}
        ) as total_completed_tests
    `;

        // Simplification: In a real app we'd calculate pending_tests and rate properly here.
        // For now, let's keep it basic to avoid over-complicating the SQL for a demo.

        const params = [];
        if (site) params.push(site);
        if (start) params.push(start);
        if (end) params.push(end);

        const result = await pool.query(query, params);
        const stats = result.rows[0];

        res.json({
            total_participants: parseInt(stats.total_participants),
            total_completed_tests: parseInt(stats.total_completed_tests),
            pending_tests: parseInt(stats.total_participants) - parseInt(stats.total_completed_tests),
            completion_rate: stats.total_participants > 0 ? (stats.total_completed_tests / stats.total_participants) * 100 : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/participants', authenticate, async (req, res) => {
    const { search, status, cargo, turma, instructor, site, start, end } = req.query;
    try {
        let query = `
      SELECT p.*, tr.dominant_profile, tr.score_d, tr.score_i, tr.score_s, tr.score_c,
             tr.mindset_tipo, tr.vac_dominante, tr.insights_consultivos,
             (tr.id IS NOT NULL) as has_completed_test
      FROM public.participants p
      LEFT JOIN public.test_results tr ON p.registration = tr.registration
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (p.name ILIKE $${paramCount} OR p.registration ILIKE $${paramCount} OR p.email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }
        if (status && status !== 'all') {
            if (status === 'Completado') query += ` AND tr.id IS NOT NULL`;
            if (status === 'Pendente') query += ` AND tr.id IS NULL`;
        }
        if (cargo && cargo !== 'all') {
            query += ` AND p.cargo = $${paramCount}`;
            params.push(cargo);
            paramCount++;
        }
        if (turma && turma !== 'all') {
            query += ` AND p.class_name = $${paramCount}`;
            params.push(turma);
            paramCount++;
        }
        if (site && site !== 'all') {
            query += ` AND p.site = $${paramCount}`;
            params.push(site);
            paramCount++;
        }

        query += ' ORDER BY p.name ASC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/test-results', authenticate, async (req, res) => {
    const {
        registration, name, email, cpf, site,
        score_d, score_i, score_s, score_c,
        dominant_profile, mindset_tipo, vac_dominante,
        insights_consultivos, class_id,
        instructor_name, instructor_registration, instructor_email, class_name
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO public.test_results 
       (registration, name, email, cpf, site, 
        score_d, score_i, score_s, score_c, 
        dominant_profile, mindset_tipo, vac_dominante, 
        insights_consultivos, class_id, 
        instructor_name, instructor_registration, instructor_email, class_name, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
            [
                registration, name, email, cpf, site,
                score_d, score_i, score_s, score_c,
                dominant_profile, mindset_tipo, vac_dominante,
                insights_consultivos, class_id,
                instructor_name, instructor_registration, instructor_email, class_name, req.user.id
            ]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/pending-users', authenticate, async (req, res) => {

    try {
        const result = await pool.query(
            "SELECT * FROM public.profiles WHERE status = 'pending' ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/approve-user', authenticate, async (req, res) => {
    const { userId, status } = req.body;
    try {
        await pool.query(
            "UPDATE public.profiles SET status = $1, updated_at = NOW() WHERE id = $2",
            [status, userId]
        );
        res.json({ message: `User ${status} successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ai/generate', authenticate, async (req, res) => {

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Google API error');
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        res.json({ text: aiResponse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/participants/lookup/:registration', authenticate, async (req, res) => {

    const { registration } = req.params;
    try {
        const result = await pool.query(
            'SELECT name, email FROM public.participants WHERE registration = $1 AND is_active = true',
            [registration]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/classes', authenticate, async (req, res) => {
    const { site } = req.query;
    try {
        let query = 'SELECT * FROM public.training_classes WHERE is_active = true';
        const params = [];
        if (site && site !== 'all') {
            query += ' AND (site = $1 OR site IS NULL OR site = \'\')';
            params.push(site);
        }
        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/classes', authenticate, async (req, res) => {
    const { name, instructor_name, instructor_registration, area, product, site } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO public.training_classes 
       (name, instructor_name, instructor_registration, area, product, site, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, instructor_name, instructor_registration, area, product, site, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/classes/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        await pool.query(
            "UPDATE public.training_classes SET is_active = $1, updated_at = NOW() WHERE id = $2",
            [is_active, id]
        );
        res.json({ message: 'Class updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Start server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
