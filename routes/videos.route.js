const videosController = require('../controllers/videos.controller');

module.exports = app => {
    app.get('/videos', videosController.getAll);
    app.get('/videos/:id', videosController.getById);
    app.post('/videos', videosController.postVideo);
};