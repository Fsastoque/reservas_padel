import { Router } from 'express';
import { getAvailabilityHandler } from '../controllers/availabilityController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/', requireAuth, getAvailabilityHandler);

export default router;
