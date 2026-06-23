import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import postsRoutes from './routes/posts';
import eventsRoutes from './routes/events';
import marketplaceRoutes from './routes/marketplace';
import messagesRoutes from './routes/messages';
import notificationsRoutes from './routes/notifications';
import neighborhoodsRoutes from './routes/neighborhoods';
import reportsRoutes from './routes/reports';
import adminRoutes from './routes/admin';
import versionsRoutes from './routes/versions';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api', limiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/neighborhoods', neighborhoodsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/versions', versionsRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`NeighborHub API running on port ${PORT}`));

export default app;
