const videosService = require('../services/videos.service');
const path = require('path');
const fs = require('fs');

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
                VideosController.streamVideo(response.stored_name, req, res);
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

    static streamVideo(videoName, req, res) {
        const movieFile = path.resolve('../uploads', videoName);
        
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

    static postVideo(req, res) {      
        
        let dataToUpload = req.files.video;

        if(dataToUpload.length >= 2) {
            let filesToMove = videosService.saveFilesToFolder(dataToUpload);  
            Promise.all(filesToMove)
                .then(response => {
                    videosService.insertVideo(response)
                        .then(response => res.status(206).json({
                            status: true,
                            message: null,
                            data: response
                        }))
                        .catch(error => res.status(500).json({
                            status: true,
                            message: error,
                            data: null
                        }));
                })
                .catch(error => console.log(error));         
        } else {
            videosService.saveFileToFolder(dataToUpload)
                .then(response => {
                    videosService.insertVideo(response)
                    .then(response => res.status(206).json({
                        status: true,
                        message: null,
                        data: response
                    }))
                    .catch(error => res.status(500).json({
                        status: true,
                        message: error,
                        data: null
                    }));
                })
                .catch(error => console.log(error));
        }
    }

}

module.exports = new VideosController();