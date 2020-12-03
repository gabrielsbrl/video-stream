const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const express = require("express");
const consig = require('consign');
const mysql = require('mysql');
const cors = require("cors");
const path = require("path");
const uuid = require('uuid');
const fs = require("fs");
const consign = require('consign/lib/consign');
const connection = require('./infraestructure/connection.service');
const tablesService = require('./infraestructure/tables.service');
const { table } = require('console');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));  
// enable file upload
app.use(fileUpload({
  createParentPath: true
}));

consign()
  .include('./routes')
  .into(app);

connection.connect(err => {
  if(err) {
    console.log('Não foi possível estabelecer uma conexão com o banco de dados! ', err.message);
  } else {
    tablesService.init(connection);
    app.listen(3000, console.log('Server online, escutando na porta 3000'))
  };
});

/* const connection = mysql.createConnection({
  host: 'localhost',
  database: 'media',
  user: 'root',
  password: 'admin123',
}); */

/* connection.connect(err => {
  if(err) {
    console.log('Não foi possível estabelecer uma conexão com o banco de dados: ', err);
  }
  else {
    console.log('Conectado ao banco de dados');
    app.post('/video', (req, res) => {
      console.log('post - videos\n');
      console.log(req.files.video);
      console.log('Filename: \n');
      console.log(req.body.name);
      let videoToUpload = req.files.video;
      let originalFileName = req.body.name + '.mp4';
      let tempFileName = uuid.v4() + '.mp4';
      videoToUpload.mv(path.resolve(__dirname, 'uploads', tempFileName), err => {
        if(err) console.log('Error on upload: ', err);
        console.log('File uploaded!');
        let pathVideo = path.resolve(__dirname, 'uploads', tempFileName).replace(/\\/g, "\\\\").replace(/\$/g, "\\$").replace(/'/g, "\\'").replace(/"/g, "\\\"");
        console.log(pathVideo);
        connection.query('INSERT INTO videos SET ?', {
          original_name: originalFileName,
          stored_name: tempFileName,
          path_video: pathVideo
        }, (err, result) => {
          if(err) console.log('Err on save video info to database: ', err);
          else console.log('Result saving video on mysql: ', result);
          res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
        });
      });
    });

    app.get("/series/all", (req, res) => {
      connection.query('SELECT * FROM videos WHERE id is not null', (err, result) => {
        if(err) {
          res.json({ status: false, message: err.message, data: null });
        } else {
          res.json({ status: true, message: null, data: result})
        }
      });
    });
    
    app.get("/movie/:name", (req, res) => {
      // need to get the video name from req params, or body - Gabriel Sobral - IBM Application Developer 
      connection.query('SELECT * FROM videos where ?', { original_name: req.params.name }, (err, result) => {
        if(err) console.log('Err on get video: ', err);
        else console.log(result);
        const movieFile = `./public/18.mp4`;
        fs.stat(movieFile, (err, stats) => {
          if (err) {
            console.log(err);
            return res.status(404).end("<h1>Movie Not found</h1>");
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
      });      
    });
    
    app.listen(3000, console.log("Server listening at port 3000"));
  }
}); */
