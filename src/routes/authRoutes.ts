import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController';
import { registerValidation, loginValidation } from '../validations/authValidation';
import validate from '../middlewares/validate';
import auth from '../middlewares/auth';

const router: Router = Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/me', auth, getMe);
router.put('/me', auth, updateProfile);

export default router;