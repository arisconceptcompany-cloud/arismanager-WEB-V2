import { Router } from 'express';
import {
  getEmployesCtrl,
  getEmployeCtrl,
  createEmployeCtrl,
  updateEmployeCtrl,
  deleteEmployeCtrl,
  getPresencesCtrl,
  getSalairesCtrl,
  updateSalaireCtrl,
  getCongesCtrl,
  approveCongeCtrl,
  rejectCongeCtrl,
  getRapportsCtrl
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/employes', getEmployesCtrl);
router.get('/employes/:id', getEmployeCtrl);
router.post('/employes', createEmployeCtrl);
router.put('/employes/:id', updateEmployeCtrl);
router.delete('/employes/:id', deleteEmployeCtrl);

router.get('/presences', getPresencesCtrl);

router.get('/salaires', getSalairesCtrl);
router.put('/salaires/:id', updateSalaireCtrl);

router.get('/conges', getCongesCtrl);
router.put('/conges/:id/approuver', approveCongeCtrl);
router.put('/conges/:id/rejeter', rejectCongeCtrl);

router.get('/rapports', getRapportsCtrl);

export default router;
