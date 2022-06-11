const verifyParams = require("./verifyParam");

const checkImage = (src, domain, url) => {
  if (src.includes('base64')) return src;
  if (src.includes("http://") || src.includes("https://")) {
    return src;
  } else {
    let src_ = src.charAt(0) === '/' ? src : '/'+src;
    if (url.includes("http://")) {
      return "http://" + domain + src_;
    } else if (url.includes("https://")) {
      return "https://" + domain + src_;
    }
  }
};

const extractHostname = (url) => {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
};

 const autoScroll = async (page) =>{
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight - window.innerHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}

module.exports = {
  verifyParams,
  checkImage,
  extractHostname,
  autoScroll,
};
