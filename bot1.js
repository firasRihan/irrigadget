const { Telegraf, Context } = require('telegraf')

var mysql = require('mysql');
var http = require('http');


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smartirrigation",
});

const bot = new Telegraf('1556599404:AAFQ4t9bKhdC7KxSrUL40H1rIqHDusmxxII')
var id = 0;

bot.start((ctx) => {
  ctx.reply("مرحباً")
  var userId = ctx.message.chat.id;
  try{
  con.query("SELECT id FROM esp8266_user_binding WHERE userId=" + userId.toString() + "", function (err, id) {

    if (id == "") {
      ctx.reply(' الرجاء ارسال رقم ال ID و ال PASSWORD المزود لك مع ترك فراغ بين الإثنين ')
      var messageinput = 0;


      bot.on('message', (ctx) => {
        console.log(ctx);
        messageinput = 0;
        messageinput = ctx.update.message.text;
       // console.log(messageinput)
        //ctx.reply(messageinput);;
        messageinput = messageinput.toString();
        messageinput = messageinput.split(" ")
        console.log(messageinput[0] + messageinput[1])
        var newMessage = [];
        var count = 0;
        var i = 0;
      


        var ID = messageinput[0].toString()
        try {
          var password = messageinput[1].toString();
        } catch (error) {
         
          ctx.reply("ادخل المعلومات")

        }
       
        // console.log(ID + password + "h");
        con.query("SELECT pass FROM esp8266_user_binding WHERE id=" + ID, function (err, pass) {
          if (pass==undefined) {
           ctx.reply("ادخل المعلومات")
          }
        
          if (pass != undefined && pass != "") {
     
            pass = JSON.stringify(pass[0]);
            pass = pass.replace(/{|}|"|:/g, "");
            pass = pass.replace(/pass/g, "");
            //console.log(pass)
            if (pass.toString() == password) {
              
              con.query("SELECT ip FROM esp8266_user_binding WHERE id=" + ID, function (err, ip) {
         
                ip = JSON.stringify(ip[0]);
                ip = ip.replace(/{|}|"|:/g, "");
                ip = ip.replace(/ip/g, "");
             //   console.log(ip)
              
              con.query("INSERT INTO esp8266_user_binding (id, userId, pass, ip) VALUES (" + ID + ", " + userId.toString() + ", " + pass + ", '" + ip + "')");
              ctx.reply("تمت الاضافة بنجاح, يمكنك الان الاستفادة من جميع الميزات.")
            })
            }
           
          }
        })
      })
      if (err) { console.log("error 66") }
    }
  })}catch{
    ctx.reply("ادخل المعلومات")
  }




})
//bot.help((ctx) => ctx.reply('Send me a sticker'))
//bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.hears('نسبة الضغط الجوي', (ctx) => {

  var userId = ctx.message.chat.id;
  con.query("SELECT id FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, id) {
    id = id[0]
    id = JSON.stringify(id);
  //  console.log(id)
    if (id != "[]"&&id!=undefined) {

      id = id.replace(/{|}|id|:|"|\[|]|/g, "")
     // console.log(id);

      con.query("SELECT Pressure FROM smart_irrigation WHERE ID=" + id.toString() + " ORDER BY Date DESC LIMIT 1", function (err, prs) {
        if (err) {
          console.log("there's an error in pressure fetching.")
          ctx.reply("هناك عطل في المنصّة, الرجاء المحاولة لاحقاً");
        }


        else {
          var pressure = JSON.stringify(prs);
          pressure = pressure.replace(/]|{|}|"|\[/g, "");
          pressure = pressure.replace(/Pressure:/g, "نسبة الضغط الجوي : ");
          ctx.reply(pressure + " Mb");
        }
      })
    }
    else {
      ctx.reply("الرجاء الضغط على /start")
    }
  })
})


bot.hears('درجة الحرارة', (ctx) => {
  var userId = ctx.message.chat.id;
 
    con.query("SELECT id FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, id) {
      id = id[0]
      id = JSON.stringify(id);
    //  console.log(id)
      if (id != "[]"&&id!=undefined) {
  
        id = id.replace(/{|}|id|:|"|\[|]|/g, "")
        console.log(id);
  
        con.query("SELECT Temp FROM smart_irrigation WHERE ID=" + id.toString() + " ORDER BY Date DESC LIMIT 1", function (err, temp) {
          if (err) {
            console.log("there's an error in temp fetching.")
            ctx.reply("هناك عطل في المنصّة, الرجاء المحاولة لاحقاً");
          }
          else {
            var Temp = JSON.stringify(temp);
            Temp = Temp.replace(/]|{|}|"|\[/g, "");
            Temp = Temp.replace(/:/g, "");
            Temp = Temp.replace("Temp", "درجة الحرارة : ");
            ctx.reply(Temp + " C ");
  
          }
        })
      }
      else {
        ctx.reply("الرجاء الضغط على /start")
      }
    })
   
 
})

bot.hears('نسبة الرطوبة', (ctx) => {
  var userId = ctx.message.chat.id;
  con.query("SELECT id FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, id) {
    id = id[0]
    id = JSON.stringify(id);
  console.log(id)
    if (id != "[]"&&id!=undefined) {

      id = id.replace(/{|}|id|:|"|\[|]|/g, "")
      console.log(id);
      con.connect(function (err) {
        con.query("SELECT Humidity FROM smart_irrigation  WHERE ID=" + id.toString() + " ORDER BY Date DESC LIMIT 1", function (err, humidity) {
          if (err) {
            console.log("there's an error in humidity fetching.")
            ctx.reply("هناك عطل في المنصّة, الرجاء المحاولة لاحقاً");
          }
          else {

            var Humidity = JSON.stringify(humidity);
            Humidity = Humidity.replace(/]|{|}|"|\[/g, "");
            Humidity = Humidity.replace(/Humidity:/g, "نسبة الرطوبة : ");
            ctx.reply(Humidity + " %");
          }
        })
      })
    }
    else {
      ctx.reply("الرجاء الضغط على /start")
    }
  })
})

bot.hears('تشغيل الريّ', (ctx) => {
  var userId = ctx.message.chat.id;
  con.query("SELECT ip FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, ip) {
    ip = ip[0]
    ip = JSON.stringify(ip);
    console.log(ip)
    if (ip != "[]" && ip!=undefined) {

      ip = ip.replace(/{|}|id|:|"|\[|]|ip|/g, "")
     console.log(ip);
  con.connect(function (err) {

    var options = {
      host: ip,
      path: '/motoron'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been received, so we just print it out here
      response.on('end', function () {
        console.log(str);
        ctx.reply("تم تشغيل الري");
      });
    }



    var request = http.request(options, callback);

  
    request.on('error', function (err) {
      console.log('there is an error motor on');
      ctx.reply('إن الإتصال منقطع مع جهاز الري , الرجاء التأكد من أن الجهاز متصل بالإنترنت ,أو معاودة التجربة لاحقاً')

    });

    request.end();



  });

    }
    else {
      ctx.reply("الرجاء الضغط على /start")
    }
})
})




bot.hears('توقيف الريّ', (ctx) => {

  var userId = ctx.message.chat.id;
  con.query("SELECT ip FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, ip) {
    ip = ip[0]
    ip = JSON.stringify(ip);
    console.log(ip)
    if (ip != "[]"&& ip!=undefined) {

      ip = ip.replace(/{|}|id|:|"|\[|]|ip|/g, "")
      console.log(ip);
  con.connect(function (err) {

    var options = {
      host: ip,
      path: '/motoroff'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been received, so we just print it out here
      response.on('end', function (err) {
        console.log(str);
        ctx.reply("تم إيقاف الريّ ");
      });
    }

    var request = http.request(options, callback)
    request.on('error', function (err) {
      console.log('there is an error motor off');
      ctx.reply('إن الإتصال منقطع مع جهاز الري , الرجاء التأكد من أن الجهاز متصل بالإنترنت ,أو معاودة التجربة لاحقاً')


    });

    request.end();

  });
    }
    else{ ctx.reply("الرجاء الضغط على /start")}
  })

})

bot.hears('تشغيل الوضع الآلي', (ctx) => {

  var userId = ctx.message.chat.id;
  con.query("SELECT ip FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, ip) {
    ip = ip[0]
    ip = JSON.stringify(ip);
    console.log(ip)
    if (ip != "[]"&& ip!=undefined) {

      ip = ip.replace(/{|}|id|:|"|\[|]|ip|/g, "")
      console.log(ip);
  con.connect(function (err) {

    var options = {
      host: ip,
      path: '/autoon'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been received, so we just print it out here
      response.on('end', function (err) {
        console.log(str);
        ctx.reply("تم تشغيل الوضع الآلي ");
      });
    }

    var request = http.request(options, callback)
    request.on('error', function (err) {
      console.log('there is an error auto on');
      ctx.reply('إن الإتصال منقطع مع جهاز الري , الرجاء التأكد من أن الجهاز متصل بالإنترنت ,أو معاودة التجربة لاحقاً')

    });

    request.end();

  });
    }else{ ctx.reply("الرجاء الضغط على /start")}
  })
})

bot.hears('ايقاف الوضع الآلي', (ctx) => {
  var userId = ctx.message.chat.id;
  con.query("SELECT ip FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, ip) {
    ip = ip[0]
    ip = JSON.stringify(ip);
    console.log(ip)
    if (ip != "[]"&& ip!=undefined) {

      ip = ip.replace(/{|}|id|:|"|\[|]|ip|/g, "")
      console.log(ip);
  con.connect(function (err) {

    var options = {
      host: ip,
      path: '/autooff'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been received, so we just print it out here
      response.on('end', function (err) {
        console.log(str);
        ctx.reply("تم ايقاف الوضع الآلي");
      });
    }

    var request = http.request(options, callback)
    request.on('error', function (err) {
      console.log('there is an error auto off');
      ctx.reply('إن الإتصال منقطع مع جهاز الري , الرجاء التأكد من أن الجهاز متصل بالإنترنت ,أو معاودة التجربة لاحقاً')

    });

    request.end();

  });
}
else{ ctx.reply("الرجاء الضغط على /start")}
  })
})
bot.hears('هل تمطر؟', (ctx) => {

  var userId = ctx.message.chat.id;
  con.query("SELECT ip FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, ip) {
    ip = ip[0]
    ip = JSON.stringify(ip);
    console.log(ip)
    if (ip != "[]"&& ip!=undefined) {

      ip = ip.replace(/{|}|id|:|"|\[|]|ip|/g, "")
      console.log(ip);
  con.connect(function (err) {

    var options = {
      host: ip,
      path: '/rainState'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been received, so we just print it out here
      response.on('end', function (err) {
        console.log(str);
        if (str == 1) {
          ctx.reply("كلا , لا تمطر");
        }
        if (str == 0) {
          ctx.reply("نعم , إنها تمطر");
        }
      });
    }

    var request = http.request(options, callback)
    request.on('error', function (err) {
      console.log('there is an error rain state');
      ctx.reply('إن الإتصال منقطع مع جهاز الري , الرجاء التأكد من أن الجهاز متصل بالإنترنت ,أو معاودة التجربة لاحقاً')

    });

    request.end();

  });
}
else{ ctx.reply("الرجاء الضغط على /start")}
  })

})

bot.hears('هل التربة جافة؟', (ctx) => {

  var userId = ctx.message.chat.id;
  con.query("SELECT ip FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, ip) {
    ip = ip[0]
    ip = JSON.stringify(ip);
    console.log(ip)
    if (ip != "[]"&& ip!=undefined) {

      ip = ip.replace(/{|}|id|:|"|\[|]|ip|/g, "")
      console.log(ip);
  con.connect(function (err) {

    var options = {
      host: ip,
      path: '/soilState'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been received, so we just print it out here
      response.on('end', function (err) {
        console.log(str);
        if (str == 0) {
          ctx.reply("كلا , التربة غير جافة");
        }
        if (str == 1) {
          ctx.reply("التربة متوسطة الرطوبة");
        }
        if (str == 2) {
          ctx.reply("نعم , التربة جافة");
        }
      });
    }

    var request = http.request(options, callback)
    request.on('error', function (err) {
      console.log('there is an error soil moist');
      ctx.reply('إن الإتصال منقطع مع جهاز الري , الرجاء التأكد من أن الجهاز متصل بالإنترنت ,أو معاودة التجربة لاحقاً')

    });

    request.end();

  });
}
else{ ctx.reply("الرجاء الضغط على /start")}
  })
})


bot.hears('هل الجو مناسب للريّ؟', (ctx) => {
  var userId = ctx.message.chat.id;
  con.query("SELECT ip FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, ip) {
    ip = ip[0]
    ip = JSON.stringify(ip);
    console.log(ip)
    if (ip != "[]"&& ip!=undefined) {

      ip = ip.replace(/{|}|id|:|"|\[|]|ip|/g, "")
      console.log(ip);
  con.connect(function (err) {

    var options = {
      host: ip,
      path: '/weatherState'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been received, so we just print it out here
      response.on('end', function (err) {
        console.log(str);
        if (str == 0) {
          ctx.reply("كلا");
        }
        if (str == 1) {
          ctx.reply("نعم");
        }
      });
    }

    var request = http.request(options, callback)
    request.on('error', function (err) {
      console.log('there is an error weather state');
      ctx.reply('إن الإتصال منقطع مع جهاز الري , الرجاء التأكد من أن الجهاز متصل بالإنترنت ,أو معاودة التجربة لاحقاً')

    });

    request.end();

  });
}
else{ ctx.reply("الرجاء الضغط على /start")}
  })

})


bot.hears('وضع الريّ الحالي', (ctx) => {

  var userId = ctx.message.chat.id;
  con.query("SELECT ip FROM esp8266_user_binding WHERE userId=" + userId.toString(), function (err, ip) {
    ip = ip[0]
    ip = JSON.stringify(ip);
    console.log(ip)
    if (ip != "[]"&& ip!=undefined) {

      ip = ip.replace(/{|}|id|:|"|\[|]|ip|/g, "")
      console.log(ip);
  con.connect(function (err) {

    var options = {
      host: ip,
      path: '/motorState'
    };

    callback = function (response) {
      var str = '';

      //another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been received, so we just print it out here
      response.on('end', function (err) {
        console.log(str);
        if (str == 1) {
          ctx.reply("الريّ غير شغال");
        }
        if (str == 0) {
          ctx.reply("الريّ شغال");
        }
      });
    }

    var request = http.request(options, callback)
    request.on('error', function (err) {
      console.log('there is an error weather state');
      ctx.reply('إن الإتصال منقطع مع جهاز الري , الرجاء التأكد من أن الجهاز متصل بالإنترنت ,أو معاودة التجربة لاحقاً')

    });

    request.end();

  });
}
else{ ctx.reply("الرجاء الضغط على /start")}

  })
})



bot.hears('تغيير ID المكنة', (ctx) => {
  var userId = ctx.message.chat.id;
  ctx.reply("هل انت متأكد؟ /YES أو /NO")
  bot.hears("/YES", (ctx) => {
    con.query("DELETE FROM esp8266_user_binding WHERE userId=" + userId.toString())
    ctx.reply("الرجاء كبس /start لإدخال البينات الجديدة")
  })

  bot.hears("/NO", (ctx) => {

    ctx.reply("حسناً")
  })

})
bot.launch()
