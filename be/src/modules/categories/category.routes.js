import { Router } from 'express'; import { listController } from './category.controller.js'; const router = Router(); router.get('/', listController); export default router;
