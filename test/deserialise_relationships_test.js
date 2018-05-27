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

  it('should ignore relationships without data', (done) => {
    let des = new Deserialiser();
    relationships = {
      children: {
        links: {
          self: "testurl",
          related: "relatedurl"
        }
      }
    }
    des.process_relationships(relationships)
      .then((res) => {
        res.should.eql({})
        done()
      })
      .catch((error) => {
        done(error);
      })
  });

  it('should resolve included relationship list', (done) => {
    let des = new Deserialiser();
    mock_relationships = {
      children: {
        data: [
          {
            type: "childtype1",
            id: "childid1"
          }
        ]
      }
    }

    mock_included = [
      {
        id: "childid1",
        type: "childtype1",
        attributes: {
          name: "childname1"
        }
      }
    ]

    des.process_included(mock_included)
    .then(() => {
      des.process_relationships(mock_relationships)
        .then((res) => {
          res.should.eql({
            children: [
              {
                type: "childtype1",
                id: "childid1",
                name: "childname1"
              }
            ]
          })
          done()
        })
        .catch((error) => {
          done(error);
        })
    })

  });

  it('should resolve included relationship item', (done) => {
    let des = new Deserialiser();
    mock_relationships = {
      children: {
        data: {
          type: "childtype1",
          id: "childid1"
        }
      }
    }

    mock_included = [
      {
        id: "childid1",
        type: "childtype1",
        attributes: {
          name: "childname1"
        }
      }
    ]

    des.process_included(mock_included)
    .then(() => {
      des.process_relationships(mock_relationships)
        .then((res) => {
          res.should.eql({
            children: {
              type: "childtype1",
              id: "childid1",
              name: "childname1"
            }
          })
          done()
        })
        .catch((error) => {
          done(error);
        })
    })

  });

  it('should resolve multilevel relationships', (done) => {
    let des = new Deserialiser();
    mock_relationships = {
      child: {
        data: {
          type: "childtype",
          id: "childid1"
        }
      }
    }

    mock_included = [
      {
        id: "childid1",
        type: "childtype",
        attributes: {
          name: "childname1"
        },
        relationships: {
          grandchild: {
            data: {
              id: "grandchildid1",
              type: "grandchild"
            }
          }
        }
      },
      {
        id: "grandchildid1",
        type: "grandchild",
        attributes: {
          gcname: "grandchildname1"
        }
      }
    ]

    des.process_included(mock_included)
    .then(() => { return des.process_relationships(mock_relationships)} )
    .then((res) => {
      res.should.eql({
        child: {
          type: "childtype",
          id: "childid1",
          name: "childname1",
          grandchild: {
            id: "grandchildid1",
            type: "grandchild",
            gcname: "grandchildname1"
          }
        }
      })
      done()
    })
    .catch((error) => {
      done(error);
    })
  })

  it('should resolve repeated relationships', (done) => {
    let des = new Deserialiser();

    let jsonapi = {
      data:[
        {
          id: "parentid1",
          type: "parent",
          attributes: {
            name: "parentname1"
          },
          relationships: {
            children: {
              data: {
                id: "childid1",
                type: "child"
              }
            }
          }
        },
        {
          id: "parentid2",
          type: "parent",
          attributes: {
            name: "parentname2"
          },
          relationships: {
            children: {
              data: {
                id: "childid1",
                type: "child"
              }
            }
          }
        }
      ],
      included: [
        {
          id: "childid1",
          type: "child",
          attributes: {
            cname: "childname1"
          }
        }
      ]
    }


    des.deserialise(jsonapi)
    .then((res) => {
      res.should.eql([
        {
          id: "parentid1",
          type: "parent",
          name: "parentname1",
          children: {
            id: "childid1",
            type: "child",
            cname: "childname1"
          }
        },
        {
          id: "parentid2",
          type: "parent",
          name: "parentname2",
          children: {
            id: "childid1",
            type: "child",
            cname: "childname1"
          }
        }
      ])
      done()
    })
    .catch((error) => {
      done(error);
    })
  })

  it('should resolve repeated and nested relationships', (done) => {
    let des = new Deserialiser();
    let jsonapi = {
      data:[
        {
          id: "parentid1",
          type: "parent",
          attributes: {
            name: "parentname1"
          },
          relationships: {
            children: {
              data: {
                id: "childid1",
                type: "child"
              }
            }
          }
        }
      ],
      included: [
        {
          id: "childid1",
          type: "child",
          attributes: {
            cname: "childname1"
          },
          relationships: {
            children: {
              data: {
                id: "childid2",
                type: "child"
              }
            },
            toys: {
              data: {
                id: "toy1",
                type: "toy"
              }
            }
          }
        },
        {
          id: "childid2",
          type: "child",
          attributes: {
            cname: "childname2"
          }
        },
        {
          id: "toy1",
          type: "toy",
          attributes: {
            tname: "toyname"
          }
        }
      ]
    }

    des.deserialise(jsonapi)
    .then((res) => {
      res.should.eql([
        {
          id: "parentid1",
          type: "parent",
          name: "parentname1",
          children: {
            id: "childid1",
            type: "child",
            cname: "childname1",
            children: {
              id: "childid2",
              type: "child",
              cname: "childname2"
            },
            toys: {
              id: "toy1",
              type: "toy",
              tname: "toyname"
            }
          }
        }
      ])
      done()
    })
    .catch((error) => {
      done(error);
    })
  })

  it('should not resolve recursive relationships', (done) => {

    let des = new Deserialiser();
    let jsonapi = {
      data:[
        {
          id: "parentid1",
          type: "parent",
          attributes: {
            name: "parentname1"
          },
          relationships: {
            children: {
              data: {
                id: "childid1",
                type: "child"
              }
            }
          }
        }
      ],
      included: [
        {
          id: "childid1",
          type: "child",
          attributes: {
            cname: "childname1"
          },
          relationships: {
            parents: {
              data: {
                id: "parentid1",
                type: "parent"
              }
            }
          }
        }
      ]
    }

    des.deserialise(jsonapi)
    .then((res) => {
      res.should.eql([
        {
          id: "parentid1",
          type: "parent",
          name: "parentname1",
          children: {
            id: "childid1",
            type: "child",
            cname: "childname1",
            parents: {
              id: "parentid1",
              type: "parent",
            }
          }
        }
      ])
      done()
    })
    .catch((error) => {
      done(error);
    })
  })

  it('should not resolve recursive includes', (done) => {

    let des = new Deserialiser();
    let jsonapi = {
      data:[
        {
          id: "parentid1",
          type: "parent",
          attributes: {
            name: "parentname1"
          },
          relationships: {
            children: {
              data: {
                id: "childid1",
                type: "child"
              }
            }
          }
        }
      ],
      included: [
        {
          id: "childid1",
          type: "child",
          attributes: {
            cname: "childname1"
          },
          relationships: {
            parents: {
              data: {
                id: "parentid1",
                type: "parent"
              }
            },
            children: {
              data: {
                id: "childid2",
                type: "child"
              }
            }
          }
        },
        {
          id: "childid2",
          type: "child",
          attributes: {
            cname: "childname2"
          },
          relationships: {
            parents: {
              data: {
                id: "childid1",
                type: "child"
              }
            }
          }
        }
      ]
    }

    des.deserialise(jsonapi)
    .then((res) => {
      res.should.eql([
        {
          id: "parentid1",
          type: "parent",
          name: "parentname1",
          children: {
            id: "childid1",
            type: "child",
            cname: "childname1",
            parents: {
              id: "parentid1",
              type: "parent",
            }
          }
        }
      ])
      done()
    })
    .catch((error) => {
      done(error);
    })
  })

});
