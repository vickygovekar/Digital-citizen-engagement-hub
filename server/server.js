const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'civic_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Database Connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
    } else {
        console.log('Connected to MySQL database');
        connection.release();
    }
});

// Promisify pool query for easier async/await usage
const promisePool = pool.promise();

app.get('/', (req, res) => {
    res.send('Digital Citizen Engagement Hub Backend is running');
});

app.get('/api', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

app.post('/api/login', async (req, res) => {
    const { email, password, role } = req.body;
    console.log('Login attempt:', { email, role });

    try {
        const [rows] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        const user = rows[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Verify role (optional, depending on if you want to enforce role check on login or just return the user's actual role)
        if (role && user.role !== role) {
            return res.status(400).json({
                status: 'error',
                message: 'Role mismatch. Please login with the correct role.'
            });
        }

        res.json({
            status: 'success',
            message: 'Login successful!',
            role: user.role,
            user: {
                id: user.id,
                fullname: user.full_name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

app.post('/api/signup', async (req, res) => {
    const { fullname, email, password, role, department } = req.body;
    console.log('Signup attempt:', { fullname, email, role, department });

    if (!fullname || !email || !password || !role) {
        return res.status(400).json({
            status: 'error',
            message: 'Please fill in all required fields.'
        });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        // Insert new user
        const [result] = await promisePool.query(
            'INSERT INTO users (full_name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
            [fullname, email, hashedPassword, role, department || null]
        );

        res.json({
            status: 'success',
            message: 'Account created successfully! Please login.',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

app.get('/api/my-reports', async (req, res) => {
    const { userId, status } = req.query;

    if (!userId) {
        return res.status(400).json({
            status: 'error',
            message: 'User ID is required'
        });
    }

    try {
        let query = 'SELECT issues.*, users.full_name FROM issues JOIN users ON issues.user_id = users.id WHERE issues.user_id = ?';
        const params = [userId];

        if (status && status !== 'All') {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await promisePool.query(query, params);

        res.json({
            status: 'success',
            data: rows
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// File Upload Configuration
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'issue-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/report-issue', upload.single('issue_image'), async (req, res) => {
    const { userId, title, category, location, description } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    console.log('Report Issue attempt:', { userId, title, category, location, imagePath });

    if (!userId || !title || !category || !location || !description) {
        return res.status(400).json({
            status: 'error',
            message: 'Please fill in all required fields.'
        });
    }

    try {
        const [result] = await promisePool.query(
            'INSERT INTO issues (user_id, title, category, location, description, image_path) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, category, location, description, imagePath]
        );

        res.json({
            status: 'success',
            message: 'Report submitted successfully!',
            reportId: result.insertId
        });
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Get Single Issue Details (for modal)
app.get('/api/issues/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await promisePool.query(`
            SELECT issues.*, users.full_name 
            FROM issues 
            JOIN users ON issues.user_id = users.id 
            WHERE issues.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Issue not found' });
        }

        const issue = rows[0];
        // Fetch upvotes count
        const [upvoteResult] = await promisePool.query('SELECT COUNT(*) as count FROM issue_upvotes WHERE issue_id = ?', [id]);
        issue.upvotes = upvoteResult[0].count;

        res.json({
            status: 'success',
            data: issue
        });
    } catch (error) {
        console.error('Error fetching issue details:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Create issue_upvotes table if not exists
const createUpvotesTable = async () => {
    try {
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS issue_upvotes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                issue_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_vote (user_id, issue_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (issue_id) REFERENCES issues(id)
            )
        `);
        console.log('issue_upvotes table checked/created');
    } catch (error) {
        console.error('Error creating issue_upvotes table:', error);
    }
};
createUpvotesTable();

// Get Community Feed
app.get('/api/feed', async (req, res) => {
    const { userId, search, sort } = req.query;
    const searchTerm = search ? `%${search}%` : '%';

    try {
        let query = `
            SELECT issues.*, users.full_name, 
            (SELECT COUNT(*) FROM issue_upvotes WHERE issue_upvotes.issue_id = issues.id AND issue_upvotes.user_id = ?) as has_voted
            FROM issues 
            JOIN users ON issues.user_id = users.id 
            WHERE (title LIKE ? OR description LIKE ? OR category LIKE ?)
        `;

        const params = [userId || 0, searchTerm, searchTerm, searchTerm];

        if (sort === 'trending') {
            query += ' ORDER BY upvotes DESC, created_at DESC';
        } else {
            query += ' ORDER BY created_at DESC';
        }

        const [rows] = await promisePool.query(query, params);

        res.json({
            status: 'success',
            data: rows
        });
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Toggle Upvote
app.post('/api/upvote', async (req, res) => {
    const { userId, issueId } = req.body;

    if (!userId || !issueId) {
        return res.status(400).json({ status: 'error', message: 'Missing userId or issueId' });
    }

    try {
        // Check if already voted
        const [existing] = await promisePool.query(
            'SELECT id FROM issue_upvotes WHERE user_id = ? AND issue_id = ?',
            [userId, issueId]
        );

        if (existing.length > 0) {
            // Remove vote
            await promisePool.query(
                'DELETE FROM issue_upvotes WHERE user_id = ? AND issue_id = ?',
                [userId, issueId]
            );
            await promisePool.query(
                'UPDATE issues SET upvotes = upvotes - 1 WHERE id = ?',
                [issueId]
            );
            res.json({ status: 'success', action: 'removed' });
        } else {
            // Add vote
            await promisePool.query(
                'INSERT INTO issue_upvotes (user_id, issue_id) VALUES (?, ?)',
                [userId, issueId]
            );
            await promisePool.query(
                'UPDATE issues SET upvotes = upvotes + 1 WHERE id = ?',
                [issueId]
            );
            res.json({ status: 'success', action: 'added' });
        }
    } catch (error) {
        console.error('Error toggling upvote:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.get('/api/dashboard', async (req, res) => {
    const { userId } = req.query;
    try {
        // Fetch stats (City-wide)
        const [totalRows] = await promisePool.query('SELECT COUNT(*) as count FROM issues');
        const [pendingRows] = await promisePool.query('SELECT COUNT(*) as count FROM issues WHERE status = "In Progress"');
        const [resolvedRows] = await promisePool.query('SELECT COUNT(*) as count FROM issues WHERE status = "Resolved"');

        // Fetch recent feed (Top 5 recent)
        const [feedRows] = await promisePool.query(`
            SELECT issues.*, users.full_name, 
            (SELECT COUNT(*) FROM issue_upvotes WHERE issue_upvotes.issue_id = issues.id) as upvotes,
            (SELECT COUNT(*) FROM issue_upvotes WHERE issue_upvotes.issue_id = issues.id AND issue_upvotes.user_id = ?) as has_voted
            FROM issues 
            JOIN users ON issues.user_id = users.id 
            ORDER BY created_at DESC 
            LIMIT 5
        `, [userId || 0]);

        res.json({
            status: 'success',
            stats: {
                total: totalRows[0].count,
                pending: pendingRows[0].count,
                resolved: resolvedRows[0].count
            },
            feed: feedRows
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Settings Endpoints
app.post('/api/settings/profile', async (req, res) => {
    const { userId, fullname, email } = req.body;
    try {
        await promisePool.query('UPDATE users SET full_name = ?, email = ? WHERE id = ?', [fullname, email, userId]);
        res.json({ status: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ status: 'error', message: 'Error updating profile' });
    }
});

app.post('/api/settings/password', async (req, res) => {
    const { userId, current_password, new_password } = req.body;
    try {
        const [rows] = await promisePool.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(current_password, user.password);

        if (!match) {
            return res.status(400).json({ status: 'error', message: 'Current password is incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await promisePool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ status: 'success', message: 'Password changed successfully!' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ status: 'error', message: 'Error changing password' });
    }
});

// Staff Dashboard Endpoints
app.get('/api/staff/dashboard', async (req, res) => {
    const { userId, department } = req.query;

    if (!department) {
        return res.status(400).json({ status: 'error', message: 'Department is required' });
    }

    try {
        // Stats
        const [pendingRows] = await promisePool.query(
            'SELECT COUNT(*) as count FROM issues WHERE category = ? AND status != "Resolved"',
            [department]
        );
        const [resolvedRows] = await promisePool.query(
            'SELECT COUNT(*) as count FROM issues WHERE category = ? AND status = "Resolved"',
            [department]
        );
        const [criticalRows] = await promisePool.query(
            'SELECT COUNT(*) as count FROM issues WHERE category = ? AND upvotes > 5 AND status != "Resolved"',
            [department]
        );

        // Tasks (Oldest First - FIFO)
        const [tasks] = await promisePool.query(`
            SELECT issues.*, users.full_name 
            FROM issues 
            JOIN users ON issues.user_id = users.id
            WHERE category = ? AND status != 'Resolved'
            ORDER BY created_at ASC
        `, [department]);

        // Recent Resolved
        const [recentResolved] = await promisePool.query(`
            SELECT issues.*, users.full_name 
            FROM issues 
            JOIN users ON issues.user_id = users.id
            WHERE category = ? AND status = 'Resolved' 
            ORDER BY created_at DESC LIMIT 5
        `, [department]);

        res.json({
            status: 'success',
            data: {
                stats: {
                    pending: pendingRows[0].count,
                    resolved: resolvedRows[0].count,
                    critical: criticalRows[0].count
                },
                tasks: tasks,
                recentResolved: recentResolved
            }
        });

    } catch (error) {
        console.error('Error fetching staff dashboard:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.post('/api/staff/update-status', async (req, res) => {
    const { issueId, newStatus } = req.body;

    try {
        await promisePool.query('UPDATE issues SET status = ? WHERE id = ?', [newStatus, issueId]);
        res.json({ status: 'success', message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.get('/api/staff/tasks', async (req, res) => {
    const { userId, department, status, sort } = req.query;

    if (!department) {
        return res.status(400).json({ status: 'error', message: 'Department is required' });
    }

    try {
        let query = `
            SELECT issues.*, users.full_name 
            FROM issues 
            JOIN users ON issues.user_id = users.id 
            WHERE category = ?
            `;
        const params = [department];

        if (status && status !== 'All') {
            query += ' AND status = ?';
            params.push(status);
        }

        switch (sort) {
            case 'priority':
                query += ' ORDER BY upvotes DESC, created_at ASC';
                break;
            case 'date_asc':
                query += ' ORDER BY created_at ASC';
                break;
            case 'date_desc':
            default:
                query += ' ORDER BY created_at DESC';
                break;
        }

        const [tasks] = await promisePool.query(query, params);

        res.json({
            status: 'success',
            tasks: tasks
        });

    } catch (error) {
        console.error('Error fetching staff tasks:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.get('/api/staff/reports', async (req, res) => {
    const { department } = req.query;

    if (!department) {
        return res.status(400).json({ status: 'error', message: 'Department is required' });
    }

    try {
        // Total Issues
        const [totalResult] = await promisePool.query('SELECT COUNT(*) as count FROM issues WHERE category = ?', [department]);
        const totalIssues = totalResult[0].count;

        // Status Counts
        const [statusResult] = await promisePool.query(`
            SELECT 
                SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as open_count,
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as progress_count,
            SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count
            FROM issues WHERE category = ?
            `, [department]);

        const statusData = statusResult[0];
        const open = parseInt(statusData.open_count || 0);
        const progress = parseInt(statusData.progress_count || 0);
        const resolved = parseInt(statusData.resolved_count || 0);

        // Resolution Rate
        const resolutionRate = totalIssues > 0 ? ((resolved / totalIssues) * 100).toFixed(1) : 0;

        // Recent Resolved
        const [recentResolved] = await promisePool.query(`
            SELECT * FROM issues 
            WHERE category = ? AND status = 'Resolved' 
            ORDER BY created_at DESC LIMIT 5
            `, [department]);

        res.json({
            status: 'success',
            data: {
                total: totalIssues,
                open,
                progress,
                resolved,
                resolutionRate,
                recentResolved
            }
        });

    } catch (error) {
        console.error('Error fetching staff reports:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
