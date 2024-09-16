import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { errorMiddleware } from './src/middleware/error.js';
import mobileUserRoutes from './src/mobileApi/mobileRoutes/mobileUserRoute.js'; 
import webUserRoutes from './src/webApi/webRoutes/webUserRoutes.js';
import excelRoutes from './src/webApi/webRoutes/excelRoutes.js'; 
// import { mobileDashboard } from './src/mobileApi/mobileModel/mobileDashboardSchema.js';
const app = express();

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); 
app.use('/api/v1/mobileUser', mobileUserRoutes);
// app.use('/api/v1/webUser', webUserRoutes);
// app.use('/api/v1/excel', excelRoutes); 
// app.use('/api/v1/dashboard', dashboardRoutes); // Use the correct route for dashboard

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
