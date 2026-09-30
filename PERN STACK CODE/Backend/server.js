const express = require("express");
const cors = require("cors");
const chatRoutes = require('./routes/chatRoutes.js');
const agentRoutes = require('./routes/agentRoutes.js');
const toolRoutes = require('./routes/toolRoutes.js');
const appRoutes = require('./routes/appRoutes.js');
const { pool } = require('./config/db.js');

const app = express();
app.use(cors());
app.use(express.json());



const configDB = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Database connected successfully.');

    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 1. Sessions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) DEFAULT 'New Chat Session',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Agents Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Standby',
        metrics JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        image VARCHAR(255) DEFAULT NULL
      );
    `);

    // 3. Messages / Commands Log Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS commands_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
        sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Canvas Documents Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS canvas_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(512),
        content TEXT DEFAULT '',
        version INT DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Database connection or initialization failed:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
};



// Manual trigger route for setup checks
app.get("/api/configDB", async (req, res) => {
  try {
    await configDB();
    res.status(200).json({ message: "Database configured successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error configuring database", error: error.message });
  }
});





app.get("/", (req, res) => {
    res.send(" Arya's Backend is running");
})

app.use('/api/chat', chatRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/apps', appRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("server running at port 3000");
})