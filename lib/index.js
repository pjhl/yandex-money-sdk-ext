const querystring = require('querystring');
const Request = require('./Request');

class YandexMoneySdk {

  constructor(accessToken, requestOptions) {
    this._accessToken = accessToken;
    this._request = new Request(requestOptions);
  }

  /**
   * Send request with accessToken
   * @param {object} params
   * @param {function} cb
   */
  sendAuthenticatedRequest(params, cb) {
    // Extend headers
    let headers = params.headers || {};
    headers['Authorization'] = 'Bearer ' + this._accessToken;
    params.headers = headers;
    // Make request
    this._request.post(params, cb);
  }

  /**
   * Get account info
   * @link https://tech.yandex.ru/money/doc/dg/reference/account-info-docpage/
   * @param cb
   */
  accountInfo(cb) {
    this.sendAuthenticatedRequest({
      path: '/api/account-info'
    }, cb);
  }

  operationHistory(options, cb) {
    this.sendAuthenticatedRequest({
      path: '/api/operation-history',
      data: options
    }, cb);
  }

  operationDetails(operation_id, cb) {
    this.sendAuthenticatedRequest({
      path: '/api/operation-details',
      data: {operation_id: operation_id}
    }, cb);
  }

  requestPayment(options, cb) {
    this.sendAuthenticatedRequest({
      path: '/api/request-payment',
      data: options
    }, cb);
  }

  processPayment(options, cb) {
    this.sendAuthenticatedRequest({
      path: '/api/process-payment',
      data: options
    }, cb);
  }

  incomingTransferAccept(operation_id, protectionCode, cb) {
    this.sendAuthenticatedRequest({
      path: '/api/incoming-transfer-accept',
      data: {
        operation_id: operation_id,
        protection_code: protectionCode || undefined
      }
    }, cb);
  }

  incomingTransferReject(operation_id, cb) {
    this.sendAuthenticatedRequest({
      path: '/api/incoming-transfer-reject',
      data: {
        operation_id: operation_id,
      }
    }, cb);
  }

  /**
   * Get access token
   * @link https://tech.yandex.ru/money/doc/dg/reference/obtain-access-token-docpage/
   * @param clientId
   * @param code
   * @param redirectURI
   * @param clientSecret
   * @param cb
   */
  getAccessToken(clientId, code, redirectURI, clientSecret, cb) {
    this._request.post({
      path: '/oauth/token',
      data: {
        code: code,
        client_id: clientId,
        redirect_uri: redirectURI,
        client_secret: clientSecret,
        grant_type: 'authorization_code'
      }
    }, cb);
  }

  /**
   * Revoke token
   * @link https://tech.yandex.ru/money/doc/dg/reference/revoke-access-token-docpage/
   * @param {function} cb   Callback(err)
   */
  revokeToken(cb) {
    this.sendAuthenticatedRequest({
      path: '/api/revoke'
    }, cb);
  }

  requestExternalPayment(instanceId, options = {}, cb) {
    options.instance_id = instanceId;
    this._request.post({
      path: '/api/request-external-payment',
      data: options
    }, cb);
  }

  processExternalPayment(instanceId, options = {}, cb) {
    options.instance_id = instanceId;
    this._request.post({
      path: '/api/process-external-payment',
      data: options
    }, cb);
  }

  /**
   * Obtain token URL
   * @param clientId
   * @param redirectURI
   * @param scope
   * @return {string}
   */
  static buildObtainTokenUrl(clientId, redirectURI, scope) {
    const query_string = querystring.stringify({
      client_id: clientId,
      redirect_uri: redirectURI,
      scope: scope.join(' '),
      response_type: "code"
    });
    return 'https://money.yandex.ru/oauth/authorize?' + query_string;
  }

  /**
   * Register an application instance.
   * @link https://tech.yandex.ru/money/doc/dg/reference/instance-id-docpage/
   * @param clientId
   * @param cb
   */
  getInstanceId(clientId, cb) {
    this._request.post({
      path: '/api/instance-id',
      data: {
        client_id: clientId
      }
    }, cb);
  }
}

module.exports = YandexMoneySdk;