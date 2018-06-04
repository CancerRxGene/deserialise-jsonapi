const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

const Deserialiser = require('../lib/deserialiser')

describe("Deserialisation include processor", () => {

  it('should return an object', (done) => {
    let des = new Deserialiser();
    des.process_included({included:[]})
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
    let jsonapi = {included:[
      {
        id: "itid1",
        type: "ittype1"
      }
    ]}
    des.process_included(jsonapi)
      .then(() => {
        des.included.should.eql({itid1__ittype1: {id: "itid1", type: "ittype1"}})
        done()
      })
      .catch((error) => {
        done(error);
      })
  });

  it('should skip items without id or type', (done) => {
    let des = new Deserialiser();
    let jsonapi = {included: [
      { type: "ittype1" },
      { id: "itid2" },
      { id: "itid3", type: "ittype3" }
    ]}
    des.process_included(jsonapi)
      .then(() => {
        let shouldbe = {itid3__ittype3: {id: "itid3", type: "ittype3"}};
        des.included.should.eql(shouldbe);
        done()
      })
      .catch((error) => {
        done(error);
      })
  });

});
