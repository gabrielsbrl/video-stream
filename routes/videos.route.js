const VideosController = require('../controllers/videos.controller');
const controller = new VideosController();
const router = require('express').Router();

router.get('/thumb/:videoHash', (req, res) => controller.getVideoThumb(req, res));
router.get('/all', (req, res) => controller.getAll(req, res));
router.get('/by-id/:videoHash', (req, res) => controller.getByHash(req, res));
router.get('/stream/:videoHash', (req, res) => controller.streamVideo(req, res));
router.post('/add', (req, res) => controller.postVideo(req, res));

module.exports = router;