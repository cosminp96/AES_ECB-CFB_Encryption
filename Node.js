const AES = require("./AES");
const Key = require("./Key");
const fs = require('fs');

module.exports = class Node {
    keyManager;
    K;
    KK;
    IV;
    message;
    name;

    constructor(keyManager, name) {
        this.keyManager = keyManager;
        this.K = new Key();
        this.KK = new Key();
        this.IV = keyManager.IV;
        this.name = name;
    }

    log(message) {
        console.log('[' + this.name + ']', message);
    }

    startCommunication(operationMode, node) {
        this.log('Initiating ' + operationMode + ' mode for communication');

        this.K.value = this.keyManager.K;

        this.log('Chosen key: ' + this.K.value);

        this.K.operationMode = operationMode;
        this.KK.value = this.keyManager.KK;
        node.K.value = AES.encrypt(AES.bytesToString(this.K.value), this.KK.value);
        node.K.operationMode = operationMode;
    }

    respondToStartCommunication() {
        if (this.K != null) {
            this.KK.value = this.keyManager.KK;

            this.log('Decrypting key: ' + this.K.value);

            this.K.value = AES.decrypt(this.K.value, this.KK.value);

            this.log('Got the key: ' + this.K.value + ' Thanks!');
        } else {
            this.log("Did not recieve key from node");
        }
    }

    sendToNode(message, node) {
        if (this.K.operationMode === 'ECB') {
            this.log("Sending message: " + message);
            node.message = this.applyECB(message, this.K.value);
        } else if (this.K.operationMode === 'CFB') {
            this.log("Sending message: " + message);
            node.message = this.applyCFB(message, this.K.value, this.IV);
        }

        node.recieveFromNode();
    }

    recieveFromNode() {
        this.log("Recieving encrypted message..." + this.message);

        if (this.K.operationMode === 'ECB') {
            this.message = this.decryptECB(this.message, this.K.value);

            this.log("Haha, decrypted the message: " + this.message);
        } else if (this.K.operationMode === 'CFB') {
            this.message = this.decryptCFB(this.message, this.K.value, this.IV);

            this.log("Haha, decrypted the message: " + this.message);
        }
    }


    applyECB(input, key) {
        let results = [];
        // Split messages into 16 bytes each
        for (let i = 0; i < input.length; i = i + 16) {
            let block = input.slice(i, i + 16);
            const padded = AES.padding(block);
            block = AES.bytesToString(padded);
            results.push(AES.encrypt(block, key));
        }
        return results;
    }

    decryptECB(input, key) {
        let results = [];

        // Split messages into 16 bytes each
        for (let i = 0; i < input.length; i++) {
            results.push(AES.decrypt(input[i], key));
        }

        return this.multiArrayBytesToString(results);
    }

    applyCFB(input, key, IV) {
        let results = [];

        // Split messages into 16 bytes each
        for (let i = 0; i < input.length; i = i + 16) {
            IV = AES.bytesToString(IV);
            let encryptedBlock = AES.encrypt(IV, key);

            this.log('Encrypted block: ' + encryptedBlock);

            let plainText = AES.padding(input.slice(i, i + 16));
            let cypherText = this.applyXOR(encryptedBlock, plainText)

            results.push(cypherText);
            IV = cypherText;
        }

        return results;
    }

    decryptCFB(input, key, IV) {
        let results = [];

        for (let i = 0; i < input.length; i++) {

            let decryptedBlock = AES.decryptCFB(IV, key)
            let plainText = this.applyXOR(decryptedBlock, input[i])

            results.push(plainText);
            IV = input[i];
        }

        return this.multiArrayBytesToString(results);
    }

    applyXOR(block1, block2) {
        for (let i = 0; i < block1.length; i++) {
            block1[i] = block1[i] ^ block2[i];
        }

        return block1
    }

    multiArrayBytesToString(input) {

        let r = '';

        for (let i = 0; i < input.length; ++i) {
            r += AES.bytesToString(input[i]);
        }
        return r;
    }

    readFromFileSync(path){
        let content = fs.readFileSync(path);
        return AES.bytesToString(content);
    }

    saveToFileSync(path, data){
        fs.writeFileSync(path, data, {encoding:'base64'});
    }

    readPictureSync(path){
        let bitmap = fs.readFileSync(path);
        var x = new Buffer(bitmap.toString()).toString('base64');
        return x;
    }
}