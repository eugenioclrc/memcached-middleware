const Transform = require('stream').Transform;

module.exports = class StreamLogger extends Transform {
  constructor(options){
    super(options);
    this._buffer = [];
  }

  _transform(chunk, enc, cb) {
    this._buffer.push(Buffer.from(chunk, enc));
    this.push(chunk, enc);
    cb();
  }

  outputString() {
    return Buffer.concat(this._buffer).toString('utf-8');
  }
}
