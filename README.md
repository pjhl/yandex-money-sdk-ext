[![Build Status](https://travis-ci.org/pjhl/yandex-money-sdk-ext.svg?branch=master)](https://travis-ci.org/pjhl/yandex-money-sdk-ext)
[![Coverage Status](https://coveralls.io/repos/pjhl/yandex-money-sdk-ext/badge.png?branch=master)](https://coveralls.io/r/pjhl/yandex-money-sdk-ext?branch=master)

NodeJS Yandex.Money API SDK
===========================

Yandex.Money API pages: [Ru](https://tech.yandex.ru/money/apps/), [En](https://tech.yandex.com/money/apps/)

Requirements
------------

*   node >= 6.5

Getting started
---------------

### Installation

```bash
npm install yandex-money-sdk-ext
```

### Payments from the Yandex.Money wallet

Using Yandex.Money API requires following steps

1. Obtain token URL and redirect user's browser to Yandex.Money service.
Note: `client_id`, `redirect_uri`, `client_secret` are constants that you get,
when [register](https://sp-money.yandex.ru/myservices/new.xml) app in Yandex.Money API.

```javascript
const YandexMoneySdk = require("yandex-money-sdk-ext");

const clientId = '/* yopur application ID */';
const scope = [
    'account-info',
    'operation-history',
    'operation-details',
    'payment-p2p',
    'incoming-transfers',
    'payment-shop'
];
const redirectURI = 'https://localhost';
const url = YandexMoneySdk.buildObtainTokenUrl(clientId, redirectURI, scope);
```

2. After that, user fills Yandex.Money HTML form and user is redirected back to `REDIRECT_URI?code=CODE`.

3. You should immediately exchange `CODE` with `ACCESS_TOKEN`.

```javascript
const YandexMoneySdk = require("yandex-money-sdk-ext");
const api = new YandexMoneySdk();

const code = '/* code from query params */';
api.getAccessToken(clientId, code, redirectURI, clientSecret, (err, data) => {
  if (err) {
    // process error
  }
  const access_token = data.access_token;
  // save it to DB, config, etc..
});
```

4. Now you can use Yandex.Money API.

```javascript
const api = new YandexMoneySdk(access_token);

// Get account info (https://tech.yandex.ru/money/doc/dg/reference/account-info-docpage/)
api.accountInfo((err, data) => {
  if (err) {
    // process error
  }
  console.log(data);
  /* Data like:
  { account: '410012345678901',
    balance: 50.25,
    currency: '643',
    account_type: 'personal',
    identified: false,
    account_status: 'named',
    balance_details: { total: 50.25, available: 50.25, hold: 0.20 }
  }
   */
});

// Fetch last 3 records of operation history (https://tech.yandex.ru/money/doc/dg/reference/operation-history-docpage/)
api.operationHistory({}, (err, data) => {
  if (err) {
    // process error
  }
  console.log(data);
  /* Data like:
  { next_record: '3',
    operations:
    [
      {pattern_id: '337',
       operation_id: '546520000000011223',
       title: 'МегаФон (Россия): +7 926 *****66',
       amount: 20,
       direction: 'out',
       datetime: '2017-02-24T12:32:42Z',
       status: 'success',
       type: 'payment-shop',
       group_id: 'pattern_337',
       categories: [Object]
      },
      // ...
    ]}  
   */
});

// Make request payment and process it
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
api.requestPayment(options, (err, data) => {
  if (err) {
    // process error
  }
  if (data.status !== "success") {
    // process failure
  }
  const request_id = data.request_id;

  api.processPayment({
    "request_id": request_id
  }, (err, data) => {
    if (err) {
      // process error
    }
    // process status
  });
});
```

### Payments from bank cards without authorization

1. Fetch instantce-id (ussually only once for every client. You can store result in DB).

```javascript 
// Create api without access token
const api = new YandexMoneySdk();
api.getInstanceId(clientId, (err, data) => {
  if (err) {
    // process error
  }
  const instanceId = data.instance_id;
  // save it to DB
});
```

2. Make request payment

```javascript 
const options = {
    // pattern_id, etc..
};

YandexMoneySdk.requestExternalPayment(instanceId, options, (err, data) => {
  if (err) {
    // process error
  }
  const requestId = data.request_id;
});
```

3. Process the request with process-payment. 

```javascript 
externalPayment.process(instanceId, {request_id: requestId}, (err, data) => {
  if (err) {
    // process error
  }
  // process data
});
```

### Request options

Request options are optional, the defaults is:

```javascript
const api = new YandexMoneySdk("access_token", {
  url: 'https://money.yandex.ru',
  userAgent: 'Yandex.Money.SDK/NodeJS',
  proxy: '' // Optional proxy server like "http://username:password@localhost:3128"
});
```

Side notes
----------

1. Each API function recieves a callback in args `err`, `data` and `response`.
Where `err` is equal to `null` when status of response is `2**`, `data` is JSONed
response and `response` is a full server response(you can check
`response.statusCode` for example).

Running tests
-------------

1. Clone this repo, install deps and devDeps.
2. Create `test/constants.js` using `test/constants.js.sample` as a template. 
3. Run `npm run test` and check the output.
