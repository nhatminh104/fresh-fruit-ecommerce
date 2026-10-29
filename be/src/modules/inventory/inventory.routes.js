import { Router } from 'express'; import { listController } from './inventory.controller.js'; const router = Router(); router.get('/', listController); export default router;
