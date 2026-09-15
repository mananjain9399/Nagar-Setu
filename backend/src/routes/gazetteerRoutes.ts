import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import { GazetteerController } from '../controllers/gazetteerController';

const router = Router();
const upload = multer({ dest: os.tmpdir() });

router.get('/wards', GazetteerController.getWards);
router.get('/localities', GazetteerController.getLocalities);
router.get('/overlaps', GazetteerController.getOverlaps);
router.post('/import', upload.single('file'), GazetteerController.importGazetteer);

export default router;
