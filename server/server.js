const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const aiRoutes = require('./routes/ai');
const authRouter = require('./routes/auth').router;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/codeforge';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error: ', err.message));

app.use('/api/auth', authRouter);
app.use('/api', apiRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', require('./routes/interview'));

app.get('/health', (req, res) => res.send('CodeForge Backend is Running'));

app.listen(PORT, () => {
    console.log(`🚀 CodeForge Server running on port ${PORT}`);
});
