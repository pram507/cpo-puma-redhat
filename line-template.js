var moment = require("moment");
var lineTemplate = {};

function fullDigits(timestamp) {
  return moment(timestamp * 1000)
    .utcOffset("+09:00")
    .format("Y-m-d HH:mm");
}

function twoDigits(timestamp) {
  return moment(timestamp * 1000)
    .utcOffset("+09:00")
    .format("HH:mm");
}

function roundToX(num, X) {
  return +(Math.round(num + "e+" + X) + "e-" + X);
}

function colorKPI(value) {
  return value > 96 ? "#00ed00" : value > 95 ? "#ef9600" : "#ff0000";
}

function listColor(mss) {
  var listColor = {
    XSOR2: "#DA1500",
    XTMK2: "#00CAF6",
    XAMB3: "#80CA00",
    XJPR1: "#8000F6"
  };
  return listColor[mss];
}

function textMSSKPI(items) {
  var text = [];
  var header = {
    type: "box",
    layout: "horizontal",
    contents: [{
      type: "text",
      text: "MSS",
      size: "sm",
      color: "#aaaaaa",
      flex: 3
    },
    {
      type: "text",
      text: "SCR",
      size: "sm",
      color: "#aaaaaa",
      flex: 2,
      align: "end"
    },
    {
      type: "text",
      text: "CCR",
      size: "sm",
      color: "#aaaaaa",
      flex: 2,
      align: "end"
    },
    {
      type: "text",
      text: "UPDATE",
      size: "sm",
      color: "#aaaaaa",
      flex: 2,
      align: "end"
    }
    ]
  };
  text.push(header);
  text.push({
    type: "separator",
    margin: "sm"
  });
  items.forEach(function (item) {
    var valueTextSCR = roundToX(item.val().scr, 1) + "%";
    var valueTextCCR = roundToX(item.val().ccr, 1) + "%";
    var formattedTime = twoDigits(item.val().updated);

    var title = {
      type: "box",
      layout: "horizontal",
      contents: [{
        type: "text",
        text: item.val().name,
        size: "sm",
        color: listColor(item.val().name),
        flex: 3
      },
      {
        type: "text",
        text: valueTextSCR,
        size: "sm",
        color: colorKPI(roundToX(item.val().scr, 1)),
        flex: 2,
        align: "end"
      },
      {
        type: "text",
        text: valueTextCCR,
        size: "sm",
        color: colorKPI(roundToX(item.val().ccr, 1)),
        flex: 2,
        align: "end"
      },
      {
        type: "text",
        text: formattedTime,
        size: "sm",
        color: "#cccccc",
        flex: 2,
        align: "end"
      }
      ]
    };
    if (item.val().name != undefined) text.push(title);
  });
  text.push({
    type: "separator",
    margin: "xl"
  });
  return text;
}

lineTemplate.tempFlex = function tempFlex(items, title, filePathSCR) {
  console.log(items.val());
  if (title == undefined) var title = "Report Updated MSS Monitoring KPI";
  return {
    type: "flex",
    altText: title,
    contents: {
      type: "carousel",
      contents: [
        templMSSKPI(items, filePathSCR),
        tempWorseTop(items.val().XAMB3),
        tempWorseTop(items.val().XSOR2),
        tempWorseTop(items.val().XTMK2),
        tempWorseTop(items.val().XJPR1)
      ]
    }
  };
};

function tempWorseTop(mss) {
  var formattedTime = "";
  mss.sai.top.worse.forEach(function (item) {
    formattedTime = item.date_name;
  });
  return {
    type: "bubble",
    styles: {
      footer: {
        separator: true
      }
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [{
        type: "text",
        text: "MSS " + mss.mss,
        weight: "bold",
        color: "#1DB446",
        size: "sm"
      },
      {
        type: "text",
        text: "TOP 10 WORSE SITE",
        wrap: true,
        weight: "bold",
        size: "lg"
      },
      {
        type: "text",
        text: "Updated, " + formattedTime,
        size: "xs",
        color: "#aaaaaa",
        wrap: true
      },
      {
        type: "text",
        text: "Site Contributor :",
        size: "xs",
        color: "#aaaaaa",
        wrap: true
      },
      {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        margin: "lg",
        contents: textTopWorse(mss.sai.top.worse)
      },
      {
        type: "separator",
        margin: "lg"
      },
      templFooter()
      ]
    }
  };
}

function textTopWorse(worse) {
  function item(f) {
    var scrccr = 100 - (f.fail_call / f.jml_call) * 100;
    var call_attempts = parseInt(f.fail_call_attempts) + parseInt(f.success_call_attempts);
    var call_answared = parseInt(f.fail_call_answered) + parseInt(f.success_call_answered);
    var scr = 100 - (parseInt(f.fail_call_attempts) / call_attempts) * 100;
    var ccr = 100 - (parseInt(f.fail_call_answered) / call_answared) * 100;

    console.log(f.site_location, f.fail_call_attempts, call_attempts, scr);
    console.log(f);
    // console.log(f.site_location, f.fail_call_answered, call_answared, ccr);
    return {
      type: "box",
      layout: "vertical",
      action: {
        type: "message",
        text: "/dancow monitoring " + f.siteid
      },
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: f.site_location,
              size: "xs",
              color: "#333333",
              weight: "bold",
              flex: 3,
              wrap: true
            },
            {
              type: "text",
              text: f.fail_call,
              size: "xs",
              color: "#ef9600",
              flex: 1,
              align: "end"
            },
            {
              type: "text",
              text: roundToX(scr, 1) + "%",
              size: "xs",
              color: colorKPI(scr),
              flex: 1,
              wrap: true,
              align: "end"
            },
            {
              type: "text",
              text: roundToX(ccr, 1) + "%",
              size: "xs",
              color: colorKPI(ccr),
              flex: 1,
              wrap: true,
              align: "end"
            }
          ]
        },
        {
          type: "text",
          text: "(" + f.siteid + ")" + " " + f.kota_kabupaten,
          size: "xxs",
          color: "#888888",
          wrap: true
        }
      ]
    };
  }

  var text = [];
  text.push({
    type: "box",
    layout: "horizontal",
    contents: [{
      type: "text",
      text: "SITE",
      size: "xs",
      color: "#aaaaaa",
      flex: 3
    },
    {
      type: "text",
      text: "FAIL",
      size: "xs",
      color: "#aaaaaa",
      flex: 1,
      align: "end"
    },
    {
      type: "text",
      text: "SCR",
      size: "xs",
      color: "#aaaaaa",
      flex: 1,
      align: "end"
    },
    {
      type: "text",
      text: "CCR",
      size: "xs",
      color: "#aaaaaa",
      flex: 1,
      align: "end"
    }
    ]
  });
  text.push({
    type: "separator",
    margin: "sm"
  });
  worse.forEach(function (f) {
    text.push(item(f));
  });
  return text;
}

function templFooter() {
  return {
    type: "box",
    layout: "horizontal",
    margin: "md",
    contents: [{
      type: "text",
      text: "@DanCow & Team",
      size: "xs",
      color: "#ff0000",
      flex: 0
    },
    {
      type: "text",
      text: "Pagi!, Pagi!, Pagi!",
      color: "#aaaaaa",
      size: "xs",
      align: "end"
    }
    ]
  };
}

function templMSSKPI(items, filePathSCR) {
  var date = new Date().getDate();
  var formattedTime = "";
  items.forEach(function (item) {
    formattedTime = fullDigits(item.val().updated);
  });
  return {
    type: "bubble",
    styles: {
      footer: {
        separator: true
      }
    },
    type: "bubble",
    hero: {
      type: "image",
      url: filePathSCR,
      size: "full",
      aspectRatio: "2:1",
      aspectMode: "cover"
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [{
        type: "text",
        text: "CORE PUMA MONITORING",
        weight: "bold",
        color: "#1DB446",
        size: "sm"
      },
      {
        type: "text",
        text: "MSS PUMA SCR & CCR",
        weight: "bold",
        size: "xl"
      },
      {
        type: "text",
        text: "Success Call Rate & Complated Call Rate:",
        size: "xs",
        color: "#aaaaaa",
        wrap: true
      },
      {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        margin: "xl",
        contents: textMSSKPI(items)
      },
      templFooter()
      ]
    }
  };
}

lineTemplate.textAbout = function textAbout() {
  return {
    type: "flex",
    altText: "About DanCOw",
    contents: {
      type: "carousel",
      contents: [{
        type: "bubble",
        hero: {
          type: "image",
          url: "https://cpo-puma.herokuapp.com/logo_wide.png",
          size: "full",
          aspectRatio: "2:1",
          aspectMode: "fit"
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [{
            type: "box",
            layout: "vertical",
            contents: [{
              type: "text",
              text: "DanCOW Bot",
              size: "xl",
              weight: "bold"
            },
            {
              type: "text",
              text: "Komandan Core & Power at @LineBot",
              size: "sm"
            }
            ]
          },
          {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            margin: "lg",
            contents: [{
              type: "box",
              layout: "baseline",
              contents: [{
                type: "text",
                text: "MSS Monitoring",
                weight: "bold",
                margin: "xs"
              }]
            },
            {
              type: "box",
              layout: "baseline",
              contents: [{
                type: "text",
                text: "commend",
                color: "#aaaaaa",
                size: "xxs",
                flex: 2
              },
              {
                type: "text",
                text: "/dancow monitoring\n" + "/dancow monitoring {siteid}",
                color: "#DA1500",
                size: "xs",
                weight: "bold",
                flex: 5,
                wrap: true,
                action: {
                  type: "message",
                  text: "/dancow monitoring"
                }
              }
              ]
            },
            {
              type: "box",
              layout: "baseline",
              contents: [{
                type: "text",
                text: "sample",
                color: "#aaaaaa",
                size: "xxs",
                flex: 2
              },
              {
                type: "text",
                text: "/dancow monitoring SON001\n" + "/dancow monitoring SON001,SMH001,AMB086",
                size: "xxs",
                weight: "bold",
                wrap: true,
                flex: 5
              }
              ]
            },
            {
              type: "box",
              layout: "baseline",
              contents: [{
                type: "text",
                text: "desc",
                color: "#aaaaaa",
                size: "xxs",
                flex: 2
              },
              {
                type: "text",
                text: "Realtime scr ccr,Top worse site contributor, Alerting, Reporting",
                size: "xxs",
                wrap: true,
                flex: 5
              }
              ]
            }
              //   {
              //     type: "box",
              //     layout: "baseline",
              //     margin: "lg",
              //     contents: [
              //       {
              //         type: "text",
              //         text: "DSP Profil",
              //         weight: "bold",
              //         flex: 0
              //       }
              //     ]
              //   },
              //   {
              //     type: "box",
              //     layout: "baseline",
              //     contents: [
              //       {
              //         type: "text",
              //         text: "commend",
              //         color: "#aaaaaa",
              //         size: "xxs",
              //         flex: 2
              //       },
              //       {
              //         type: "text",
              //         text: "/dancow dsp",
              //         size: "sm",
              //         wrap: true,
              //         flex: 5
              //       }
              //     ]
              //   },
              //   {
              //     type: "box",
              //     layout: "baseline",
              //     contents: [
              //       {
              //         type: "text",
              //         text: "Desc",
              //         color: "#aaaaaa",
              //         size: "xxs",
              //         flex: 2
              //       },
              //       {
              //         type: "text",
              //         text: "Data Subs Profile of Region, Branch, SubBranch, Kabupataen & SiteID",
              //         size: "xxs",
              //         wrap: true,
              //         flex: 5
              //       }
              //     ]
              //   }
            ]
          }
          ]
        },
        footer: templFooter()
      }]
    }
  };
};

module.exports = lineTemplate;