import express from "express";
import authRoutes from './routes/auth.routes.js';


const app = express();

// Middleware essencial: avisa ao Express que vamos receber dados em formato JSON
app.use(express.json());
app.use('/api/auth', authRoutes);
const port = 3001;
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
