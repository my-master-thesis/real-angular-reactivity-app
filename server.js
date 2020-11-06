const express = require('express');

const app = express();

app.use(express.static('./dist/a9'));

app.get('/*', (req, res) =>
  res.sendFile('index.html', {root: 'dist/angular-heroku/'}),
);

app.listen(process.env.PORT || 8080);
