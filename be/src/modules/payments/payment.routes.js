import { Router } from 'express'; import { createController } from './payment.controller.js'; const router = Router(); router.post('/', createController); export default router;
