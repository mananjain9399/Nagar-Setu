import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import { ImportController } from '../controllers/importController';

const router = Router();
const upload = multer({ dest: os.tmpdir() });

router.post('/json', ImportController.importJSON);
router.post('/csv', upload.single('file'), ImportController.importCSV);
router.post('/sample', ImportController.importSampleCSV);

export default router;
