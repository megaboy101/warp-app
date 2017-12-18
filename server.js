const express = require('express'), // Http server framework
      ExpressPeerServer = require('peer').ExpressPeerServer, // PeerJS wrapper for express
      randomWord = require('random-word'), // Giant word bank
      webpack = require('webpack'), // File bundler/compiler
      webpackDM = require('webpack-dev-middleware'), // Compiler runner for express
      config = require('./webpack.config.dev.js'); // Compiler config

const app = express(), // Generate new express instance
      compiler = webpack(config), // Compiler instance
      server = require('http').createServer(app); // Create a server for WebRTC to access

// Server middleware
// Expose compiler to run when server starts
app.use(webpackDM(compiler, {
  publicPath: config.publicPath
}));

// Expose src directory to be served
app.use(express.static('src'));

// Expose http route for webRTC
app.use('/peer', ExpressPeerServer(server, { debug: true }))

// Http route to send html when page loads
app.get('/', (req, res) => {
  res.send('index.html');
  res.end();
});

// Api route to send a random word on request, and for words already generated to avoid duplicates
let words = [];
app.get('/random', (req, res) => {
  let word = randomWord()

  while (words.indexOf(word) !== -1) {
    word = randomWord();
  }

  words.push(word);
  res.send(word);
  res.end();
});

// Startup server
server.listen(3000,  err => {
  if (err) { console.log(err); }

  console.log('Server online on port 3000, wait for webpack to compile');
});