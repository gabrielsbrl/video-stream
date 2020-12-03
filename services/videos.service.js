const connection = require('../infraestructure/connection.service');

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
}

module.exports = new VideosService();