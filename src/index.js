// Uses jquery for quick dom manipulation, and peerJS as a WebRTC library
const $ = require('jquery'),
      Peer = require('peerjs');


// Load a random ID from the server
function loadId() {
  return new Promise((res, rej) => {
    fetch('/random')
      .then(res => res.text())
      .then(data => {
        console.log('Word fetched: ' + data);
        res(data)
      });
  });
}

// Async function that loads an id, then uses it to construct a peer object
function startPeer() {
  return new Promise((resolve, reject) => {
    loadId().then(id => {
      const peer = new Peer(id, { host: 'localhost', port: 3000, path: '/peer' });
      console.log('Peer loaded');
      resolve(peer);
    });
  })
}

// Routes for incomming peer messages
function routeMessages(peer) {
  // When a connection request arrives...
  peer.on('connection', conn => {
    console.log('I received a connection');

    // Connect back to the sender if not already connected
    if (window.peerList.indexOf(conn.peer) === -1) {
      connectToPeer(peer, conn.peer);
      window.peerList.push(conn.peer);
    }

    // When a complete connection has been established...
    conn.on('open', () => {
      console.log('Connection opened');

      // Convert received ArrayBuffer to a usable blob, and create an anchor tag that links the received file
      conn.on('data', data => {
        const blob = new Blob([data.file], { type: data.filetype });
        const url = URL.createObjectURL(blob);
        const name = data.filename
        
        console.log('File received');
        $('#file').after('<a id="newFile" href="'+url+'" download="'+name+'" >You\'ve got file!</a>')
      });
    });
  });
}

// Connect a peer to the specified ID
function connectToPeer(peer, otherId) {
  window.conn = peer.connect(otherId);

  window.conn.on('open', () => {
    console.log('I connected to a peer');
  });
}

// Send a message to peer
function sendMessage(input) {
  if (window.conn) {
    window.conn.send(input);
  }
}

// Load UI Actions
function loadUI(peer) {
  console.log('UI Actions loaded');

  $('#connect').click(() => {
    console.log('Connecting to peer');

    const input = $('#peerId').val();
    $('#peerId').val('');

    window.peerList.push(input);
    connectToPeer(peer, input);
  });

  $('#submit').click(() => {
    console.log('Submitting file');
    const files = document.getElementById('file').files;

    sendMessage({
      file: new Blob(files, { type: files[0].type }),
      filename: files[0].name,
      filetype: files[0].type
    });
  });
}

// Start Program
$(document).ready(() => {
  window.peerList = [];

  startPeer().then(peer => {
    routeMessages(peer);
    loadUI(peer);
  })
});