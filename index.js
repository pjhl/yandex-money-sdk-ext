const Wallet = require("./lib/Wallet.js");
const externalPayment = require("./lib/external_payment.js");
const base = require("./lib/base.js");

module.exports = {
  Wallet: Wallet,
  ExternalPayment: externalPayment.ExternalPayment,
  Config: base.Config
};
