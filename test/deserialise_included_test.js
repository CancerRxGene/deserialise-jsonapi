const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

const Deserialiser = require('../lib/deserialiser')

describe("Deserialisation include processor", () => {

  it('should return an object', (done) => {
    let des = new Deserialiser();
    des.process_included([])
      .then((res) => {
        res.should.eql({})
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
      .then((res) => {
        res.should.eql({itid1_ittype1: {id: "itid1", type: "ittype1"}})
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
      .then((res) => {
        let shouldbe = {itid3_ittype3: {id: "itid3", type: "ittype3"}};
        res.should.eql(shouldbe);
        des.included.should.eql(shouldbe);
        done()
      })
      .catch((error) => {
        done(error);
      })
  });

  it('should resolve attributes in included items', (done) => {
    let des = new Deserialiser();
    let mock_inc = [
      {
        id: "id1",
        type: "type1",
        attributes: {
          name: "name1"
        }
      }
    ]
    des.process_included(mock_inc)
      .then((res) => {
        let shouldbe = {id1_type1: {id: "id1", type: "type1", name: "name1"}};
        res.should.eql(shouldbe);
        des.included.should.eql(shouldbe);

        done()
      })
      .catch((error) => {
        done(error);
      })
  });

});
