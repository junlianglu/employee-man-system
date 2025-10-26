import express from "express"
import authRoutes from './routes/authRoutes.js';
import cors from "cors"

import uploadRoutes from "./routes/uploadRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/registration-tokens', registrationTokenRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
app.use("/api/upload", uploadRoutes);

export default app;

