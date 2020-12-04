const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const path = require("path");
const connection = require('../services/connection.service');
const tablesService = require('../services/tables.service');
// Environment constants
const PORT = process.env.PORT || 3000;
const API_VERSION = 'v1';
// Routers 
const videosRouter = require('../routes/videos.route');

module.exports = app => new Promise((resolve, reject) => {

    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));  
    // enable file upload
    app.use(fileUpload({
      createParentPath: true
    }));

    app.use('/api/' + API_VERSION + '/video', videosRouter);

    connection.connect(err => {
        if(err) {
          reject('* não foi possível estabelecer uma conexão com o banco de dados');
        } else {
          tablesService.init(connection);
          resolve('+ conectado a base de dados');
        };
    });

});