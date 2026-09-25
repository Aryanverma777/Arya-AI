const express = require("express");
const cors = require("cors");
const chatRoutes = require('./routes/chatRoutes.js');
const agentRoutes = require('./routes/agentRoutes.js');
const toolRoutes = require('./routes/toolRoutes.js');
const appRoutes = require('./routes/appRoutes.js');

const app = express();
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send(" Arya's Backend is running");
})

app.use('/api/chat', chatRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/apps', appRoutes);

app.listen(3000, () => {
    console.log("server running at port 3000");
})