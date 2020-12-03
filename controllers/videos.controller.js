const videosService = require('../services/videos.service');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

class VideosController {

    getAll(req, res) {
        videosService.getAll()
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

    getById(req, res) {
        let { id } = req.params;
        videosService.getById(id)
            .then(response => {    
                console.log('response: ', response);            
                VideosController.streamVideo(response.path_video, req, res);
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
        VideosController.postVideo(req, res);
    }

    static streamVideo(videoPath, req, res) {
        const movieFile = path.resolve(videoPath);
        
        fs.stat(movieFile, (error, stats) => {
            console.log('from fs stat');
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

    static postVideo(req, res) {
        
        console.log('+ post - videos\n');
        console.log(req.files.video);
        console.log('+ filename: \n');
        console.log(req.body.name);

        let videoToUpload = req.files.video;
        let originalFileName = req.body.name + '.mp4';
        let tempFileName = uuid.v4() + '.mp4';

        videoToUpload.mv(
            path.resolve(__dirname, 'uploads', tempFileName), 
            err => 
        {
            if(err) {                
                console.log('- error on upload: ', err);
                res.json({
                    status: false,
                    message: err,
                    data: null
                });
            } else {
                console.log('- file uploaded!');
                
                let pathVideo = path.resolve(__dirname, 'uploads', tempFileName).replace(/\\/g, "\\\\").replace(/\$/g, "\\$").replace(/'/g, "\\'").replace(/"/g, "\\\"");

                let videoToInsert = {
                    original_name: originalFileName,
                    stored_name: tempFileName,
                    path_video: pathVideo
                };

                videosService.insertVideo(videoToInsert)
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
        });        
    }

}

module.exports = new VideosController();