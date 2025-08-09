import express from 'express';
//import * as customerRoutesModule from './customerRoutes';


import customersRouter from './customerRoutes';
import employeeRouter from './employeeRoutes';
import notificationRouter from './notificationRoutes';
import dasboardRouter from './dashboardRoutes';
import serviceOrder from './serviceOrderRoutes'
const router = express.Router();

// Use the default export from customerRoutes if available
router.use('/customers', customersRouter);
router.use('/employees', employeeRouter);
router.use('/notifications', notificationRouter);
router.use('/dashboard', dasboardRouter);
router.use('/service-orders', serviceOrder);

// Export ES6 style
export default router;

// Export CommonJS style
//module.exports = router;