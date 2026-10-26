import { Router } from 'express';
import {
  cancelReservationHandler,
  createReservationHandler,
  listReservations,
} from '../controllers/reservationsController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/', createReservationHandler);
router.get('/', listReservations);
router.post('/:id/cancel', cancelReservationHandler);

export default router;
