import { Router } from 'express';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth';
import * as controller from '../controllers/adminController';

const router = Router();
router.use(authenticate, requireAdmin);

// Users
router.get('/users', controller.listUsers);
router.get('/users/:id', controller.getUser);
router.post('/users/:id/suspend', controller.suspendUser);
router.post('/users/:id/ban', controller.banUser);
router.post('/users/:id/reactivate', controller.reactivateUser);

// Content
router.get('/content/flagged', controller.listFlaggedContent);
router.post('/content/:id/approve', controller.approveContent);
router.post('/content/:id/remove', controller.removeContent);
router.post('/content/:id/pin', controller.pinContent);

// Reports
router.get('/reports', controller.listReports);
router.post('/reports/:id/resolve', controller.resolveReport);

// Analytics
router.get('/analytics', controller.getAnalytics);

// Notifications
router.post('/notifications/send', controller.sendNotification);

// Neighborhoods
router.get('/neighborhoods', controller.listNeighborhoods);
router.put('/neighborhoods/:id/toggle', controller.toggleNeighborhood);

// Versions
router.get('/versions', controller.listVersions);
router.post('/versions', requireSuperAdmin, controller.createVersion);
router.put('/versions/:id/release', requireSuperAdmin, controller.releaseVersion);
router.put('/versions/:id/force-update', requireSuperAdmin, controller.setForceUpdate);
router.put('/versions/:id/deprecate', requireSuperAdmin, controller.deprecateVersion);

export default router;
