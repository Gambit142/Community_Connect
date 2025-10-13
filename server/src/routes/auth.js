const express = require('express');
const router = express.Router();
const { register, verify } = require('../controllers/auth/register.js');
const { login } = require('../controllers/auth/login.js');
const { forgotPassword, resetPassword } = require('../controllers/auth/passwordRecovery.js');

router.post('/register', register);
router.get('/verify/:token', verify);
router.post('/login', login);
router.post('/forgot', forgotPassword);
router.post('/reset', resetPassword);

module.exports = router;