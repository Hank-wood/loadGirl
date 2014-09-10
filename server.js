var http = require('http');
var fs = require("fs");

function getOptions(page) {
  return {
    host: 'jandan.net',
    path: '/ooxx/page-' + page,
    method: 'get',
    headers: {
      "Accept": "	text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN, zh;q=0.8",
      "Cache-Control": "max-age=0",
      "Connection": "Keep-Alive",
      "Host": "jandan.net",
      "User-Agent": "	Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0"
    }
  }
}

function downloadPage(page, callback) {
  http.get(getOptions(page), function (res) {
    var data = "";
    
    res.on('data', function (chunk) {
      data += chunk;
    });
    
    res.on("end", function () {
      callback(data);
    });
  }).on("error", function () {
    callback(null);
  });
}

function downloadImg(imgUrl) {
  var imgName = imgUrl.match(/(\w+)\.(png|gif|jpg)$/)[0];

  http.get(imgUrl, function (res) {
    var imgData = "";

    res.setEncoding("binary");

    res.on("data", function (chunk) {
      imgData += chunk;
    });

    res.on("end", function () {
      fs.writeFile("./img/" + imgName, imgData, "binary", function (err) {
        if (err) {
          console.log("downloadImg fail");
        } else {
          console.log("downloadImg success");
        }
      });
    });
    
  });
}

function lesgo(page) {

  downloadPage(page, function (data) {

    if (data) {
      var result = data.match(/\<img src="([^\<]+)" \/\>/g);
      
      for (var i = 0, len = result.length; i < len; i++) {
        var temp = result[i];
        var imgUrl = "";

        // 需要要load gif图，就开启这个，注释下面的
        /*if( temp.indexOf("org_src") > -1 ){
            imgUrl = temp.match(/org_src="([^"]+)"/)[1];
         }else{
            imgUrl = temp.match(/src="([^"]+)"/)[1];
         }*/

        imgUrl = temp.match(/src="([^"]+)"/)[1];

        downloadImg(imgUrl);
      }
    } else {
      console.log("downloadPage error");
    }
  });

}

var beginPage = 1107; //开始页码
var pages = 2; //需要抓多少页
for (var p = beginPage; p > beginPage - pages; p--) {
  lesgo(p);
}

