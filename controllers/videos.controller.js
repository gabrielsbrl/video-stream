const VideosService = require('../services/videos.service');
const path = require('path');
const fs = require('fs');

class VideosController {

    constructor() {
        console.log('+ videos controller instanciado');
        this.videosService = new VideosService();
    }

    getVideoThumb(req, res) {
        let { videoHash } = req.params;
        this.videosService.getThumbByHash(videoHash)
            .then(response => {           
                res.sendFile(path.resolve(__dirname, '../storage/thumbs/' + response.thumb));
            })
            .catch(error => {
                res.json({
                    status: false,
                    message: error,
                    data: null
                });
            });            
    }

    getAll(req, res) {
        this.videosService.getAll()
            .then(response => {
                let videos = response;
                res.json({
                    status: true,
                    message: null,
                    data: videos
                });
            })
            .catch(error => {
                res.json({
                    status: false,
                    message: error,
                    data: null
                });
            });     
    }
    
    streamVideo(req, res) {
        let { videoHash } = req.params;
        this.videosService.getByHashToStream(videoHash)
            .then(response => {           
                this.stream(response.videoName, req, res);
            })
            .catch(error => {
                res.json({
                    status: false,
                    message: error,
                    data: null
                });
            });        
    }

    getByHash(req, res) {
        let { videoHash } = req.params;
        this.videosService.getByHash(videoHash)
            .then(response => {           
                res.json({
                    status: true,
                    message: null,
                    data: response
                });  
            })
            .catch(error => {
                res.json({
                    status: false,
                    message: error,
                    data: null
                });
            });
    }

    postVideo(req, res) {
        console.log('+ videos - POST');
        let videosToUpload = req.files.video;
        this.videosService.uploadVideo(videosToUpload)
            .then(() => {
                res.status(201).json({
                    status: true,
                    message: null,
                    data: null
                })
            })
            .catch(error => {
                res.status(500).json({
                    status: false,
                    message: error,
                    data: null
                });
            }); 
    }

    stream(videoName, req, res) {
        console.log('VIDEO NAME: ', videoName);
        const movieFile = path.resolve(__dirname, '../storage/videos/', videoName);
        
        fs.stat(movieFile, (error, stats) => {
          if (error) {
            console.log(error);
            return res.status(404).json({
                status: false,
                message: error,
                data: null
            });
          }
          // Variáveis necessárias para montar o chunk header corretamente
          const { range } = req.headers;
          const { size } = stats;
          const start = Number((range || "").replace(/bytes=/, "").split("-")[0]);
          const end = size - 1;
          const chunkSize = end - start + 1;
          // Definindo headers de chunk
          res.set({
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4",
          });
          // É importante usar status 206 - Partial Content para o streaming funcionar
          res.status(206);
          // Utilizando ReadStream do Node.js
          // Ele vai ler um arquivo e enviá-lo em partes via stream.pipe()
          const stream = fs.createReadStream(movieFile, { start, end });
          stream.on("open", () => stream.pipe(res));
          stream.on("error", (streamErr) => res.end(streamErr));
        });
    }

}

module.exports = VideosController;