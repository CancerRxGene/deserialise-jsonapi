import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const should = chai.should();

import Deserialiser from '../index.js';

describe("Single object deserialisation", () => {

  it('should be a function', () => {
    Deserialiser.should.be.a('function');
    let des = new Deserialiser();
    des.should.not.be.undefined;
  });

  it('should reject a response without data', (done) => {
    let des = new Deserialiser();
    des.deserialise({})
    .then((res) => {
      throw new Error('was not supposed to succeed');
      done();
    })
    .catch((error) => {
      error.should.equal("No data found");
      done()
    })
  });

  it('loads from data.attributes', (done) => {
    let des = new Deserialiser();
    let jsonapi = {
      data: {
        id: "testid",
        type: "testtype",
        attributes: {
          name: "test"
        }
      }
    }

    des.deserialise(jsonapi)
    .then((res) => {
      res.should.eql({id: "testid", type: "testtype", name: "test"});
      done();
    })
    .catch((error) => {
      done(error)
    })
  });
});
