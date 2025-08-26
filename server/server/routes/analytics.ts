import express from 'express';
import analytics from '../dashboardControllers/analytic';

const router = express.Router();

router.get('/', analytics.getDashboard.bind(analytics));

export default router;
