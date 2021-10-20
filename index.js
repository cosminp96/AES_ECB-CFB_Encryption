const KeyManager = require('./KeyManager');
const Node = require('./Node');

const OPERATION_MODE = 'ECB';

let KM = new KeyManager();

let A = new Node(KM, 'A');
let B = new Node(KM, 'B');

A.startCommunication(OPERATION_MODE, B);
B.respondToStartCommunication();

A.sendToNode('This is just a test message', B);
B.sendToNode('Iconic', A);

A.sendToNode(A.readFromFileSync('text.txt'), B);
B.sendToNode(B.readFromFileSync('text2.txt'), A);

A.sendToNode(A.readPictureSync('test.bmp'),B);
B.saveToFileSync('test_result.bmp', B.message);