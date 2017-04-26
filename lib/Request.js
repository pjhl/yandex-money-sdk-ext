const _ = require('underscore');
const request = require('request');

class Request {

  constructor(options) {
    this._options = _.extend({
      /**
       * Api url
       * @type {string}
       */
      url: 'https://money.yandex.ru',
      /**
       * Request user-agent
       * @type {string}
       */
      userAgent: 'Yandex.Money.SDK/NodeJS',
      /**
       * Request proxy (url)
       * Example: "http://username:password@localhost:3128"
       * @type {string}
       */
      proxy: 'http://user:pro123xy@185.22.61.181:6060'
    }, options);
  }

  /**
   * Make POST request to yandex money
   * @param {object}    params  Params: {{path:'/path',data:{*}, headers:{*}}}
   * @param {function}  cb      Callback(err, body, response)
   */
  post(params, cb) {
    const url = this._options.url + params.path;
    const data = params.data || {};
    const headers = params.headers || {};
    headers['User-Agent'] = this._options.userAgent;

    request.post({
      url: url,
      form: data,
      headers: headers,
      proxy: this._options.proxy || undefined,
      strictSSL: false
    }, (error, response, body) => {
      if (error) {
        return cb(error);
      }
      switch (response.statusCode) {
        case 400:
          cb(new Error("Format error"));
          break;
        case 401:
          cb(new Error("Token error"));
          break;
        case 403:
          cb(new Error("Scope error"));
          break;
        default:
          let parsedBody = '';
          try {
            parsedBody = JSON.parse(body);
          } catch (e) {
            // hide error
          }
          cb(null, parsedBody, response);
      }
    });
  }
}

module.exports = Request;