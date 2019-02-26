const express = require("express");
const WebSocket = require('ws');
const path = require("path");
const line = require("@line/bot-sdk");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;
const lineAccount = {
  pram: "U49f359a627201274e2bd4990a379c589",
  groupDancow: "C71fbe9d7f1f17cadb271a4467df9ce49"
};

const lineTemplate = require("./line-template");
const fs = require("fs");
const moment = require("moment");
const plotly = require("plotly")("pramana507", "Qt4l3vhuAEBlmHWGFIaR");
const lineChart = {};

// const wss = new SocketServer({
//   port: PORT
// });

//firebase auth
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cpo-puma.firebaseio.com"
});
const db = admin.database();

//line auth
const config = {
  channelAccessToken: "2l68X13cr/CJS80UWuY7MIPQXRakgJIpNn4Fspr5d6oky8AuebcpYRpEmgVlzMXexZceJLUdw2QUtYZTNNAlMI4MYqg4nk/+p5/kAwvwQJFPYRzihyDHYHmYUlENZHVT4y9at1E4QGgTzdwdL4gZVwdB04t89/1O/w1cDnyilFU=",
  channelSecret: "ae6781a322ef6da5c9d6648479a46515"
};
const lineClient = new line.Client(config);

function sendtoClient(event) {
  console.log('typeof wss :', (typeof wss))
  if (typeof wss !== 'undefined') {
    if (wss.clients.length == 0) {
      lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: 'sorry, currently no client (online) attach to server for handle ur request.\ncontact pram for check the client !!!'
      });
    }
    wss.clients.forEach(function (client) {
      client.send(JSON.stringify(event));
    });
  }
}

function lineHandleEvent(event) {
  console.log(event);

  // if (event.type !== "message" || event.message.type !== "text") {
  //   if (event.type == "join" || event.type == "memberJoined") {
  //     lineClient.replyMessage(event.replyToken, {
  //       type: "text",
  //       text: "Hi, Team. please try message commend :\n /dancow"
  //     });
  //   }
  // }

  if (event.type === "message" || event.message.type !== "text") {
    const baseCMD = {
      "/dancow": "DanCow",
      "/cpopuma": "CPO Puma",
      "/romance": "SQA PUMA"
    };
    if (event.message.text.split(' ')[0] in baseCMD) {
      if (lineClient != null && event.source.userId != lineAccount.pram)
        lineClient.pushMessage(lineAccount.pram, {
          type: 'text',
          text: `user send : ${event.source.userId} \n commend : ${event.message.text}`
        });
    }
  }
  sendtoClient(event);
  return Promise.resolve(null);


  return Promise.resolve(true);
}

const server = express()
  .post("/webhook", line.middleware(config), (req, res) => {
    Promise.all(req.body.events.map(lineHandleEvent)).then(result => res.json(result));
  })
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .use(
    bodyParser.urlencoded({
      extended: true
    })
  )
  .use(bodyParser.json())
  .get("/client", (req, res) => {
    console.log('typeof wss :', (typeof wss))
    if (typeof wss !== 'undefined') {
      let numberClient = 0;
      wss.clients.forEach(function (client) {
        if (client !== wss && client.readyState === WebSocket.OPEN) {
          ++numberClient;
        }
      });
      if (numberClient == 0) {
        res.send(`sorry, currently  ${numberClient} client (offline) to server for handle ur request.\ncontact super admin for check the client !!!`);
      }
      res.send(`successfully, currently ${numberClient} client (online) attach to server for handle ur request.`);
    }
  })
  .post("/sai", (req, res) => {
    var db = admin.database();
    Object.keys(req.body).forEach(function (k) {
      db.ref(`devices/mss/${k}/sai/top/worse`).set(req.body[k]);
    });
    res.send(req.body); // echo the result back
  })
  .post("/helloworld", (req, res) => res.send(req))
  .get("/mss/update", (req, res) => {
    let update = req.query || req.params;
    console.log(update);
    if (update) {
      let mss = update.mss;
      const newData = update;
      const promiseAsync = new Promise(resolve => {
        // const snap = admin.database().ref().update(updates);
        db.ref(`devices/mss/${mss}`).update(newData);
        const keytime = newData.updated;
        const timestamp = {
          scr: newData.scr,
          ccr: newData.ccr,
          label: newData.mss,
          datetime: newData.updated
        };
        resolve("insert Ok");
      });

      promiseAsync
        .then(res => console.log("hasil async: ", res))
        .catch(err => console.log("error", err));
    }
    res.status(200).json({
      test: update
    });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const SocketServer = WebSocket.Server;
const wss = new SocketServer({
  server
});

function numberClient() {
  let numberClient = 0;
  if (typeof wss !== 'undefined') {
    wss.clients.forEach(function (client) {
      if (client !== wss && client.readyState === WebSocket.OPEN) {
        ++numberClient;
      }
    });
  }
  return numberClient;
}

function noop() {
  console.log('send ping');
  return true;
}

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws) => {

  console.log('Client connected');
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  if (lineClient != null) lineClient.pushMessage(lineAccount.pram, {
    type: 'text',
    text: 'client connected : (' + numberClient() + ')'
  });

  ws.on('close', () => {
    console.log('Client disconnected')
    if (lineClient != null) lineClient.pushMessage(lineAccount.pram, {
      type: 'text',
      text: 'client disconnected (' + numberClient() + ')'
    });
  });

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 10000);