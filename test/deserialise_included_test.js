const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

const Deserialiser = require('../lib/deserialiser')

describe("Deserialisation include processor", () => {

  it('should return an object', (done) => {
    let des = new Deserialiser();
    des.process_included([])
      .then(() => {
        des.included.should.eql({})
        done()
      })
      .catch((error) => {
        done(error);
      })
  });

  it('should contain single included item', (done) => {
    let des = new Deserialiser();
    let mock_inc = [
      {
        id: "itid1",
        type: "ittype1"
      }
    ]
    des.process_included(mock_inc)
      .then(() => {
        des.included.should.eql({itid1_ittype1: {id: "itid1", type: "ittype1"}})
        done()
      })
      .catch((error) => {
        done(error);
      })
  });

  it('should skip items without id or type', (done) => {
    let des = new Deserialiser();
    let mock_inc = [
      { type: "ittype1" },
      { id: "itid2" },
      { id: "itid3", type: "ittype3" }
    ]
    des.process_included(mock_inc)
      .then(() => {
        let shouldbe = {itid3_ittype3: {id: "itid3", type: "ittype3"}};
        des.included.should.eql(shouldbe);
        done()
      })
      .catch((error) => {
        done(error);
      })
  });

});
