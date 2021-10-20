module.exports = class Key {
    value;
    operationMode;
  constructor(value, operationMode) {
    this.value = value;
    if (operationMode == null){
      this.operationMode = '';
    } else {
      this.operationMode = operationMode;
    }
  }
}