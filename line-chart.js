const plotly = require("plotly")("pramana507", "Qt4l3vhuAEBlmHWGFIaR");
const fs = require("fs");
const moment = require("moment");
const lineChart = {};

lineChart.generateMssChart = function generateMssChart(req, res, db) {
  function rand() {
    return Math.random();
  }
  db.ref(`monitoring/mss`)
    .once("value")
    .then(function (snapshot) {

      db.ref(`line/monitoring/filePathSCR`)
        .once("value")
        .then(function (snap) {

          var old = snap.child("new").val();
          var filePathOld = "";
          if (old != undefined) {
            filePathOld = old.filePath;
            db.ref(`line/monitoring/filePathSCR/old`).push(old);
          }

          var timestamp = Math.round(new Date().getTime() / 1000);
          var filePathNew = `scr_${timestamp}.png`;
          db.ref(`line/monitoring/filePathSCR/new`).set({
            filePath: filePathNew,
            urlPath: 'https://cpo-puma.herokuapp.com/chart/' + filePathNew,
            updated: timestamp
          });

          lineChart.processChart("mss_scr", snapshot, res, filePathOld, filePathNew);
        });
    });
};

lineChart.processChart = function processChart(mss_scr, snapshot, res, filePathOld, filePathNew) {


  var list_mss = ["XSOR2", "XTMK2", "XAMB3", "XJPR1"];
  var list_color = {
    XSOR2: "#DA1500",
    XTMK2: "#00CAF6",
    XAMB3: "#80CA00",
    XJPR1: "#8000F6"
  };
  var tracker = [];

  snapshot.forEach(function (mss) {

    var x = [];
    var y = [];
    mss.forEach(function (timestamp) {
      x.push(moment(timestamp.key * 1000).utcOffset("+09:00").format());
      y.push(timestamp.val().scr);
    });

    var trackerChild = {
      y: y,
      x: x,
      mode: "lines",
      name: mss.key,
      line: {
        color: list_color[mss.key],
        // shape: 'spline',
        width: 5,
        dash: "solid",
        shape: "linear",
        simplify: true
      },
      connectgaps: true
    };
    tracker.push(trackerChild);
  });

  const figure = {
    data: tracker,
    layout: {
      legend: {
        xanchor: "right",
        yanchor: "bottom",
        orientation: "h",
        font: {
          color: "#ffffff"
        },
        y: 1,
        x: 1,
        traceorder: "normal"
      },
      showlegend: true,
      yaxis: {
        color: "#ffffff"
      },
      xaxis: {
        type: "date",
        showgrid: false,
        color: "#ffffff"
      },
      font: {
        size: 18
      },
      margin: {
        l: 50,
        r: 50,
        t: 50,
        b: 50,
        pad: 0,
        autoexpand: true
      },
      color: "#ffffff",
      paper_bgcolor: "#313131",
      plot_bgcolor: "#313131"
    }
  };
  const imgOpts = {
    format: "png",
    width: 1000,
    height: 500
  };

  console.log(figure);

  plotly.getImage(figure, imgOpts, function (error, imageStream) {
    if (error) {
      console.log(error);
      return false;
    }

    var fileStream = fs.createWriteStream("./public/chart/" + filePathNew);
    imageStream.pipe(fileStream);
    imageStream.on("end", function () {
      if (res != undefined)
        res.render("pages/chart", {
          filePathOld: filePathOld,
          filePathNew: filePathNew
        });
    });

  });


};

module.exports = lineChart;
