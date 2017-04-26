var util = require('util');
var querystring = require("querystring");
var request = require('request');
base = require("./base.js");


const Request = require('./Request');

function Wallet(accessToken) {

  this._request = new Request();

  this.sendAuthenticatedRequest = (params, cb) => {
    // Extend headers
    let headers = params.headers || {};
    headers['Authorization'] = "Bearer " + accessToken;
    params.headers = headers;
    // Make request
    this._request.post(params, cb);
  };

  this.accountInfo = function (callback) {
    this.sendAuthenticatedRequest({
      path: "/api/account-info"
    }, callback);
  };

  this.operationHistory = function (options, callback) {
    this.sendAuthenticatedRequest({
      path: "/api/operation-history",
      data: options
    }, callback);
  };

  this.operationDetails = function (operation_id, callback) {
    this.sendAuthenticatedRequest({
      path: "/api/operation-details",
      data: {operation_id: operation_id}
    }, callback);
  };

  this.requestPayment = function (options, callback) {
    this.sendAuthenticatedRequest({
      path: "/api/request-payment",
      data: options
    }, callback);
  };

  this.processPayment = function (options, callback) {
    this.sendAuthenticatedRequest({
      path: "/api/process-payment",
      data: options
    }, callback);
  };

  this.incomingTransferAccept = function (operation_id, protectionCode,
                                          callback) {
    this.sendAuthenticatedRequest({
      path: "/api/incoming-transfer-accept",
      data: {
        "operation_id": operation_id,
        "protection_code": protectionCode || undefined
      }
    }, callback);
  };

  this.incomingTransferReject = function (operation_id,
                                          callback) {
    this.sendAuthenticatedRequest({
      path: "/api/incoming-transfer-reject",
      data: {
        "operation_id": operation_id,
      }
    }, callback);
  };

}


Wallet.buildObtainTokenUrl = function (clientId, redirectURI, scope) {
  var query_string = querystring.stringify({
    client_id: clientId,
    redirect_uri: redirectURI,
    scope: scope.join(' '),
    response_type: "code"
  });
  return util.format("%s/oauth/authorize?%s",
    base.Config.SP_MONEY_URL, query_string);
};

Wallet.getAccessToken = function (clientId, code, redirectURI, clientSecret,
                                  callback) {
  var full_url = base.Config.SP_MONEY_URL + "/oauth/token";
  request.post({
      "url": full_url,
      "form": {
        "code": code,
        "client_id": clientId,
        "redirect_uri": redirectURI,
        "client_secret": clientSecret,
        "grant_type": "authorization_code"
      }
    }, base.processResponse(callback)
  );

};

Wallet.revokeToken = function (token, revoke_all, callback) {
  base.sendUnauthenticatedRequest({
    url: "/api/revoke",
    data: {
      "revoke_all": revoke_all
    },
    headers: {
      "Authorization": "Bearer " + token
    }
  }, callback);
};

module.exports.Wallet = Wallet;

