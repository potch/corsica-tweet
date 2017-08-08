/* Description:
 *   Loads content from Sean Martell's Mozilla logo page.
 *
 * Dependencies:
 *   none
 *
 * Author:
 *    mythmon
 */

var cheerio = require('cheerio');
var tweet = require('./tweet');

module.exports = function(corsica) {

  var req = corsica.request;
  var youtube_re = RegExp('twitter.com/.*');

  function og(url, cb) {
    req(url, function (error, res, body) {
      var $ = cheerio.load(body);
      let og = $('meta[property^="og:"]');
      og = Array.from(og).reduce((obj, el) => {
        obj[el.attribs.property.replace('og:', '')] = el.attribs.content;
        return obj;
      }, {});
      cb(og);
    });
  }

  corsica.on('content', function(msg) {
    if (!('url' in msg)) {
      return msg;
    }

    if (match = msg.url.match(youtube_re)) {
      return new Promise(function (resolve, reject) {
        og(msg.url, function (og) {
          msg.type = 'html';
          msg.content = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      * {
        box-sizing: border-box;
      }
      html {
        height: 100%;
      }
      body {
        background: #000;
        display: flex;
        flex-direction: column;
        height: 100vh;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        margin: 0;
      }
      img {
        flex: 1;
        display: block;
        object-fit: contain;
        margin: 2vh;
        max-width: 99vw;
      }
      footer {
        background: #222;
        width: 100%;
        color: #eee;
        font-size: 2.5vh;
        padding: 1em 2em;
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .logo {
        color: #bbb;
      }
    </style>
  </head>
  <body>
    <img src="${og.image}">
    <footer>
      <div class="logo">
        ${og.title}
      </div>
      <div>${og.description}</div>
    </footer>
  </body>
</html>
          `;
          resolve(msg);
        });
      });
    }

    return msg;
  });
};
