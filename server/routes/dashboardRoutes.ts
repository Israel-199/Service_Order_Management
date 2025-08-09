import express from 'express';
import homeDashboard from './home';
import analyticsDashboard from './analytics';

const router = express.Router();

router.use('/home', homeDashboard);
router.use('/analytics', analyticsDashboard);

export default router;
