const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

const Deserialiser = require('../lib/deserialiser')

describe("Deserialisation relationship resolver", () => {



  it('should deserialise list relationships', (done) => {
    let des = new Deserialiser();
    relationships = {
      children: {
        data: [
          {
            type: "childtype1",
            id: "childid1"
          },
          {
            type: "childtype2",
            id: "childid2"
          }
        ]
      }
    }
    des.process_relationships(relationships)
      .then((res) => {
        res.should.eql({children: [
          {type: "childtype1", id: "childid1"},
          {type: "childtype2", id: "childid2"},
        ]})
        done()
      })
      .catch((error) => {
        done(error);
      })
  });

});
