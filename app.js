import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import cookieParser from 'cookie-parser';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);

// const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(cookieParser());

// app.use(cors());
app.use(cors({
  origin: process.env.FRONTEND_BASE_URL,
  credentials: true
}));

app.use(express.json());
// app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
// app.get('/upload/:id', (req, res) => {
//   res.sendFile(path.join(__dirname, `./frontend/test.html`));
// });


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
}).catch(err => console.log(err));