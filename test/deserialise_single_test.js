const should = require('chai').should();
const Deserialiser = require('../lib/deserialiser')

describe("Single object deserialisation", () => {

  it('should be a function', () => {
    Deserialiser.should.be.a('function');
    let des = new Deserialiser();
    console.log(des);
    des.should.not.be.undefined;
  });

  it('loads from .data', () => {
    true.should.be.true;
  });
  it('creates an object', () => {

  });
});
