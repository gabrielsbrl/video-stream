const connection = require('../infraestructure/connection.service');
const uuid = require('uuid');
const path = require('path');

class VideosService {
    getAll() {
        let query = 'SELECT original_name as video_name, id as identificator FROM videos';
        return new Promise((resolve, reject) => connection.query(query, (err, result) => {
            if(err) {
                reject(err);
            } else {
                resolve(result);
            }
        }));
    }

    getById(id) {
        let query = 'SELECT *  FROM videos where ?';
        let dataToSearchFor = { id };
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

    saveFileToFolder(dataToSave) {
        let tempFileName = uuid.v4() + '.mp4';
        let filePath = path.resolve(__dirname, '../uploads/', tempFileName);
        let fileData = {
            original_name: dataToSave.name,
            stored_name: tempFileName,
            path_video: filePath
        };
        return new Promise((resolve, reject) => dataToSave.mv(filePath, err => {
            if(err) reject(err);
            resolve(fileData);
        }))
    }

    saveFilesToFolder(dataToSave) {
        return dataToSave.map(d => {
            let tempFileName = uuid.v4() + '.mp4';
            let filePath = path.resolve(__dirname, '../uploads/', tempFileName);            
            let fileData = {
                original_name: d.name,
                stored_name: tempFileName,
                path_video: filePath
            };
            return new Promise((resolve, reject) => d.mv(filePath, err => {
                if(err) reject(err);
                resolve(fileData);
            }))
        });            
    }
}

module.exports = new VideosService();