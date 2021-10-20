const AES = require('./AES');

module.exports = class KeyManager {
  K; // Cheia de criptare
  KK;
  IV;

  constructor() {
    this.K = AES.generateKey();
    this.KK = AES.generateKey();
    this.IV = AES.generateIV();
  }
}
