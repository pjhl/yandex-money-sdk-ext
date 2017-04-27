const assert = require('assert');
const YandexMoneySdk = require('../lib/index');
const CONSTANTS = require("./constants");

describe('YandexMoneySdk', function () {
  this.timeout(5000);

  describe('#utils', function () {
    it('should return auth url for browser redirect', function () {
      const scope = ['account-info', 'operation-history'];
      const url = YandexMoneySdk.buildObtainTokenUrl(CONSTANTS.clientId, "http://localhost:8000/redirect", scope);
      assert(!!url);
    });

    it("should exchange code to access token (fake)", function (done) {
      const sdk = new YandexMoneySdk();
      sdk.getAccessToken("client id", "code", "redirect uri", null,
        function (error, data, response) {
          assert.equal(response.statusCode, 200);
          done();
        });
    });
  });

  describe("#accountInfo", function () {
    it("should return account information", function (done) {
      const sdk = new YandexMoneySdk(CONSTANTS.accessToken);
      sdk.accountInfo(function myCallback(error, data, response) {
        assert.strictEqual(error, null);
        assert(!!data);
        assert.strictEqual(response.statusCode, 200);
        done();
      });
    });
  });

  describe("#operationHistory", function () {
    it("should return operation history", function (done) {
      const sdk = new YandexMoneySdk(CONSTANTS.accessToken);
      sdk.operationHistory({records: 3}, (error, data, response) => {
        assert.strictEqual(error, null);
        assert(!!data);
        assert.strictEqual(response.statusCode, 200);
        console.log(data);
        done();
      });
    });
  });

  describe("#operationDetails", function () {
    it("should return operation history(fake)", function (done) {
      const sdk = new YandexMoneySdk(CONSTANTS.accessToken);
      sdk.operationDetails("some operation id",
        function myCallback(error, data, response) {
          //console.log(data);
          // yandex api always returns 200 if request is correct
          assert.equal(response.statusCode, 200);
          done();
        });
    });
  });

  describe("#payment", function () {
    const sdk = new YandexMoneySdk(CONSTANTS.accessToken);
    let request_id = null;

    it("should make a request payment ", function (done) {
      const options = {
        "pattern_id": "p2p",
        "to": "410011161616877",
        "amount_due": "0.02",
        "comment": "test payment comment from yandex-money-nodejs",
        "message": "test payment message from yandex-money-nodejs",
        "label": "testPayment",
        "test_payment": true,
        "test_result": "success"
      };
      sdk.requestPayment(options,
        function myCallback(error, data, response) {
          assert.equal(response.statusCode, 200);
          request_id = data.request_id;
          done();
        });
    });

    it("should make a response payment", function (done) {
      sdk.processPayment({
        request_id: request_id,
        test_payment: true,
        test_result: "success"
      }, function myCallback(error, data, response) {
        assert.equal(data.status, "success");
        assert.strictEqual(error, null);
        assert.strictEqual(data.status, "success");
        assert.strictEqual(response.statusCode, 200);
        done();
      });
    });
  });

  describe("#transfer", function () {

    it("should accept incoming transfer(fake)", function (done) {
      const sdk = new YandexMoneySdk(CONSTANTS.accessToken);
      sdk.incomingTransferAccept("some operation id", null,
        function myCallback(error, data, response) {
          //console.log(data);
          assert.equal(response.statusCode, 200);
          done();
        });
    });

    it("should reject incoming transfer(fake)", function (done) {
      const sdk = new YandexMoneySdk(CONSTANTS.accessToken);
      sdk.incomingTransferReject("some operation id",
        function myCallback(error, data, response) {
          assert.equal(response.statusCode, 200);
          done();
        });
    });

  });

  describe("external payments", function () {
    this.timeout(5000);

    let request_id = null;
    let instance_id = null;
    describe("#getInstanceId", function () {
      it("should get instance id", function (done) {
        const sdk = new YandexMoneySdk();
        sdk.getInstanceId(CONSTANTS.clientId, function (error, data) {
          assert.strictEqual(error, null);
          assert.strictEqual(data.status, "success");
          assert(!!data.instance_id);
          instance_id = data.instance_id;
          done();
        });
      });
    });

    describe("#request", function () {
      it("should make request external payment", function (done) {
        const requestOptions = {
          "pattern_id": "p2p",
          "to": "410011161616877",
          "amount_due": "0.01",
          "comment": "test payment comment from yandex-money-nodejs",
          "message": "test payment message from yandex-money-nodejs",
          "label": "testPayment",
        };
        const sdk = new YandexMoneySdk();
        sdk.requestExternalPayment(instance_id, requestOptions, (error, data, response) => {
          assert.strictEqual(error, null);
          assert.strictEqual(response.statusCode, 200);
          assert.strictEqual(data.status, 'success');
          assert(!!data.request_id);
          request_id = data.request_id;
          done();
        });
      });
    });

    describe("#process", function () {
      it("should make a process payment", function (done) {
        const sdk = new YandexMoneySdk();
        sdk.processExternalPayment(instance_id, {
          request_id: request_id,
          ext_auth_success_uri: "http://lcoalhost:8000",
          ext_auth_fail_uri: "http://localhost:8000"
        }, (error, data, response) => {
          assert.strictEqual(error, null);
          assert.strictEqual(response.statusCode, 200);
          assert.strictEqual(data.status, 'ext_auth_required');
          done();

        });
      });
    });

    describe("#exceptions", function () {
      it("should return TokenError in YandexMoneySdk.revokeToken", function (done) {
        const sdk = new YandexMoneySdk("somemisspelledtoken");
        sdk.revokeToken((error) => {
          assert.equal(error.message, "Token error");
          done();
        });
      });

      it("should return ScopeError", function (done) {
        const sdk = new YandexMoneySdk("some invalid token");
        sdk.accountInfo((error) => {
          assert.equal(error.message, "Format error");
          done();
        });
      });
    });
  });
});