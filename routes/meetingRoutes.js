import express from 'express';
import { createMeeting, validateMeeting } from '../controllers/meetingController.js';

const router = express.Router();

router.post('/create', createMeeting);
router.get('/validate/:meetingId', validateMeeting);

export default router;
