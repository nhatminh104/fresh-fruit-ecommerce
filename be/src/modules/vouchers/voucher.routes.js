import { Router } from 'express'; import { listController } from './voucher.controller.js'; const router = Router(); router.get('/', listController); export default router;
