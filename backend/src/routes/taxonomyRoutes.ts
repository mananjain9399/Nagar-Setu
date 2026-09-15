import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import { TaxonomyController } from '../controllers/taxonomyController';

const router = Router();
const upload = multer({ dest: os.tmpdir() });

router.get('/taxonomy', TaxonomyController.getTaxonomy);
router.get('/departments', TaxonomyController.getDepartments);
router.get('/locations', TaxonomyController.getLocations);
router.post('/taxonomy/validate', upload.single('file'), TaxonomyController.validateTaxonomy);
router.post('/taxonomy/import', upload.single('file'), TaxonomyController.importTaxonomy);

export default router;
