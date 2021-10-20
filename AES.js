const AES = require('./lib/aes-lib');

module.exports = {
    /**
     * @param input
     * @returns {*|Uint8Array}
     */
    stringToBytes: function (input) {
        return AES.utils.utf8.toBytes(input);
    },

    /**
     * @param input
     * @returns {string}
     */
    bytesToString: function (input) {
        return AES.utils.utf8.fromBytes(input);
    },

    generateRandom16Array() {
        let result = [];

        for (let i = 0; i < 16; ++i) {
            result.push(Math.floor(Math.random() * 100));
        }

        return new Uint8Array(result);
    },

    generateIV: function () {
        return this.generateRandom16Array();
    },

    generateKey: function () {
        return this.generateRandom16Array();
    },

    concatTypedArrays: function(a, b) { // a, b TypedArray of same type
        var c = new (a.constructor)(a.length + b.length);
        c.set(a, 0);
        c.set(b, a.length);
        return c;
    },

    concatBytes: function(ui8a, byte) {
        var b = new Uint8Array(1);
        b[0] = byte;
        return this.concatTypedArrays(ui8a, b);
    },

    encrypt: function (input, key) {
        const bytes = this.stringToBytes(input);

        return new AES.AES(key).encrypt(bytes);
    },

    decrypt: function (input, key) {
        return new AES.AES(key).decrypt(input);
    },

    decryptCFB: function (input, key) {
        return new AES.AES(key).encrypt(input);
    },

    padding: function (input) {
        input = this.stringToBytes(input);
        let remaining = 16 - input.length % 16;
        if (remaining === 16) {
            return input;
        }
        while (remaining) {
            input = this.concatBytes(input, 0);
            remaining--;
        }
        return input;
    },

    removePadding: function (input) {
        let index = input.length - 1;

        while (input[index] === 0) {
            input = input.slice(0, index - 1);
        }

        return input;
    }
};
