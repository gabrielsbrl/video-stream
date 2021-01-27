const uuid = require('uuid');
const path = require('path');

class FileService {
    
    constructor() {
        console.log('+ file service instanciado');
        this.filesFolder = 'storage';
    }

    generateFileName(fileType) {
        return uuid.v4() + fileType;
    }

    generateFilePath(fileName, folderToStoreFile) {
        return path.resolve(__dirname, `../${this.filesFolder}/${folderToStoreFile}/`, fileName);
    }

    moveFile(file, fileType, folderToStoreFile) {
        let fileName = this.generateFileName(fileType);
        let filePath = this.generateFilePath(fileName, folderToStoreFile);
        return new Promise((resolve, reject) => file.mv(filePath, err => {
            if(err) reject(`Error while moving the file ${file.name}`);
            resolve({
                original_name: file.name,
                stored_name: fileName,
                path: filePath
            });
        }));
    }

    moveFiles(files, filesType, folderToStoreFiles) {
        return files.map(file => {
            let fileName = this.generateFileName(filesType);
            let filePath = this.generateFilePath(fileName, folderToStoreFiles);;                        
            return new Promise((resolve, reject) => file.mv(filePath, err => {
                if(err) reject(`Error while moving the file ${file.name}`);
                resolve({
                    original_name: file.name,
                    stored_name: fileName,
                    path: filePath
                });
            }))
        });    
    }

    resolveFolderPath(folder, file = '') {
        return path.resolve(__dirname, `../storage/${folder}/${file}`);
    }

}

module.exports = FileService;