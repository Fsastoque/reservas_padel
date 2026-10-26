import { Router } from 'express';
import { listCourts } from '../controllers/courtsController';

const router = Router();

router.get('/', listCourts);

export default router;
