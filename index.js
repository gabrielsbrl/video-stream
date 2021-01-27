const express = require('express');
const expressInfra = require('./infraestructure/express.infraestructure');
const app = express();

expressInfra(app)
  .then(response => {
    console.log(response);
    app.listen(3000, console.log('+ servidor escutando na porta 3000'));
  })
  .catch(error => {
    console.log(error);
    console.log('- não foi possivel iniciar o servidor');
  });