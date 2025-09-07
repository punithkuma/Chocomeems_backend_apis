const router = require('express').Router();
const { instructorSignup, instructorLogin, studentSignup, studentLogin, studentLists } = require('../controllers/authController');

router.post('/instructors/signup', instructorSignup);
router.post('/instructors/login', instructorLogin);
router.post('/students/signup', studentSignup);
router.post('/students/login', studentLogin);
router.get('/students', studentLists);

module.exports = router;
