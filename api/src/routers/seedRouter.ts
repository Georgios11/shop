import { Router } from 'express';
import { seedData } from '../controllers/seedController';
const seedRouter: Router = Router();

seedRouter.post('/', seedData);
// seedRouter.post('/clear-cookie', clearCookies);
export default seedRouter;
