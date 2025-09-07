const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { uploadMiddleware, uploadVideo, listVideos, getStreamUrl, grantAccess } = require('../controllers/videoController');

router.get('/', auth(), listVideos);
router.post('/', auth('instructor'), uploadMiddleware, uploadVideo);
router.get('/:id/stream', auth(), getStreamUrl);
router.post('/:id/grant', auth('instructor'), grantAccess);

module.exports = router;
