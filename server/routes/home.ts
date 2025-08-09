import express from 'express';
import home from '../dashboardControllers/homeDashboard';

const router = express.Router();

router.get('/', home.getDashboard.bind(home));

export default router;
