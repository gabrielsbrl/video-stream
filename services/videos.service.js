const connection = require('./connection.service');
const FileService = require('./file.service');
const ThumbnailGenerator = require('video-thumbnail-generator').default;
const uuid = require('uuid');
class VideosService {

    constructor() {
        console.log('+ videos service instanciado');
        this.fileService = new FileService();
    }

    getAll() {
        let query = 'SELECT original_name as name, video_hash as identificator FROM videos';
        return new Promise((resolve, reject) => connection.query(query, (err, result) => {
            if(err) {
                reject(err);
            } else {
                resolve(result);
            }
        }));
    }

    getByHash(video_hash) {
        let query = 'SELECT original_name as name, video_hash as identificator  FROM videos where ?';
        let dataToSearchFor = { video_hash };
        return new Promise((resolve, reject) => connection.query(query, dataToSearchFor, (err, result) => {
            if(err) {
                reject(err);
            } else {
                if(result.length) {
                    resolve(result[0]);
                } else {
                    reject({
                        message: 'Nenhum vídeo foi encontrado com base no id informado'
                    });
                }
            }
        }));
    }

    getThumbByHash(video_hash) {
        let query = 'SELECT video_thumb as thumb  FROM videos where ?';
        let dataToSearchFor = { video_hash };
        return new Promise((resolve, reject) => connection.query(query, dataToSearchFor, (err, result) => {
            if(err) {
                reject(err);
            } else {
                if(result.length) {
                    resolve(result[0]);
                } else {
                    reject({
                        message: 'Nenhum vídeo foi encontrado com base no id informado'
                    });
                }
            }
        }));
    }

    getByHashToStream(video_hash) {
        let query = 'SELECT stored_name as videoName  FROM videos where ?';
        let dataToSearchFor = { video_hash };
        return new Promise((resolve, reject) => connection.query(query, dataToSearchFor, (err, result) => {
            if(err) {
                reject(err);
            } else {
                if(result.length) {
                    resolve(result[0]);
                } else {
                    reject({
                        message: 'Nenhum vídeo foi encontrado com base no id informado'
                    });
                }
            }
        }));
    }
    
    insertVideos(videosToInsert) {
        let query = 'INSERT INTO videos (original_name, stored_name, path_video, video_thumb, video_hash) VALUES ?';
        return new Promise((resolve, reject) => connection.query(query, [videosToInsert], (err, response) => {
            if(err) {
                console.log('err insertVideo: ', err);
                reject(err);
            } else {
                console.log('response insertVideo: ', response)
                resolve(response);
            }
        }));
    }

    insertVideo(videoToInsert) {
        let query = 'INSERT INTO videos SET ?';
        return new Promise((resolve, reject) => connection.query(query, videoToInsert, (err, response) => {
            if(err) {
                console.log('err insertVideo: ', err);
                reject(err);
            } else {
                console.log('response insertVideo: ', response)
                resolve(response);
            }
        }));
    }
    
    saveVideosToFolder(files) {
        return this.fileService.moveFiles(files, '.mp4', 'videos');
    }

    saveVideoToFolder(file) {
        return this.fileService.moveFile(file, '.mp4', 'videos');
    }    
    
    parseVideosAndThumbToPersistance(videoInfo) {
        return videoInfo.map(async v => {
            let videoThumb = await this.generateVideoThumb(v);  
            let videoHash = uuid.v4();
            return [
                this.removeFileExtensionFromVideoname(v.original_name),
                v.stored_name,
                v.path,
                videoThumb,
                videoHash
            ];
        });
    }

    async parseVideoAndThumbToPersistance(videoInfo) {   
        let videoThumb = await this.generateVideoThumb(videoInfo);  
        let videoHash = uuid.v4();
        return {
            original_name: this.removeFileExtensionFromVideoname(videoInfo.original_name),
            stored_name: videoInfo.stored_name,
            path_video: videoInfo.path,
            video_thumb: videoThumb,
            video_hash: videoHash
        };
    }

    generateVideoThumb(videoInfo) {
        const tg = new ThumbnailGenerator({
            sourcePath: videoInfo.path,
            thumbnailPath: this.fileService.resolveFolderPath('thumbs'),
            tmpDir: this.fileService.resolveFolderPath('temp')
        });           
        return tg.generateOneByPercent(90);
    }

    removeFileExtensionFromVideoname(videoName) {
        return videoName.replace('.mp4', '');
    }

    uploadVideo(files) {
        return new Promise(async (resolve, reject) => {
            try {
                if(files.length >= 2) {
                    console.log('- doing videos upload');
                    let storedVideosInfo = await Promise.all(this.saveVideosToFolder(files));
                    let videosToPersist = await Promise.all(this.parseVideosAndThumbToPersistance(storedVideosInfo));
                    await this.insertVideos(videosToPersist);
                    resolve();
                } else {
                    console.log('- doing video upload');
                    let videoToPersist = await this.saveVideoToFolder(files);   
                    let parsedVideo = await this.parseVideoAndThumbToPersistance(videoToPersist) 
                    await this.insertVideo(parsedVideo);
                    resolve();
                }
            } catch(exception) {
                console.log('* exception / ', exception);
                reject(exception);
            }
        });
    }

}

module.exports = VideosService; 