'use strict';

let _isArray = require('lodash/isArray')
let _isPlainObject = require('lodash/isPlainObject')
let _assign = require('lodash/assign')

class Deserialiser {

  constructor(options){
    this.options = options;
    this.included = null;
  }

  process_related_item(relitem, chain){
    let inc_key = this.generate_key(relitem);
    let relitem_res = null;

    if(this.included && inc_key in this.included){
      // if the related item is present in the included section
      let relitem_inc = this.included[inc_key];
      relitem_res = this.extract_attributes(relitem_inc);
      if('relationships' in relitem_inc){
        this.process_relationships(relitem_inc.relationships, chain)
        .then((resolved_relations) => {
            return _assign(relitem_res, resolved_relations)
        })
      }
    } else {
      // the related item is not present in the included section
      relitem_res = this.extract_attributes(relitem);
    }
    return relitem_res;
  }

  process_relationships(relationships, chain = {}){
    let self = this;
    return new Promise((resolve, reject) => {
      if(!_isPlainObject(relationships)){
        reject(new Error("Relationships is not an object"))
      }

      let relations = Object.keys(relationships)
      let res = relations.reduce((acc, relation) => {
        if('data' in relationships[relation]){
          let reldat = relationships[relation].data

          if(_isPlainObject(reldat)){
            let relkey = self.generate_key(reldat)
            if(!(relkey in chain)){
              let chain_copy = Object.assign({}, chain)
              chain_copy[relkey] = true;
              acc[relation] = self.process_related_item(reldat, chain_copy)
            }

          } else if (_isArray(reldat)){
            acc[relation] = reldat
            .filter((r) => !(self.generate_key(r) in chain))
            .map((r) => {
              let relkey = self.generate_key(r)
              let chain_copy = Object.assign({}, chain)
              chain_copy[relkey] = true;
              return self.process_related_item(r, chain_copy)
            })
          }
        }
        return acc
      }, {})

      resolve(res)

    })
  }

  generate_key(item) {
    if(!('id' in item) || !('type' in item)){
      return 'invalid'
    }
    return item.id + "_" + item.type
  }

  validate_item(item) {
    if(!('id' in item) || !('type' in item)){
        return false
      }
    return true
  }

  extract_attributes(item){
    return  _assign({id: item.id, type: item.type}, item.attributes || {})
  }

  process_item(item){
    let resp_obj = this.extract_attributes(item);

    if('relationships' in item){
      this.process_relationships(item.relationships)
      .then((rels) => {
        _assign(resp_obj, rels)
      })
    }
    return resp_obj
  }

  get_object_attributes(obj){
    let self = this;

    return new Promise((resolve, reject) => {

      if(!self.validate_item(obj)){
        reject(new Error("Invalid object" + JSON.stringify(obj)))
      }

      resolve(
        self.process_item(obj)
      );

    })
  }

  process_included(included_src){
    let self = this;
    return new Promise((resolve, reject) => {

      if(self.included !== null){
        resolve()
      }

      if(!included_src){
        self.included = [];
        resolve();
      }

      let included = null;

      if(_isPlainObject(included_src)){
        // assume the included_src is the whole jsonapi response
        if('included' in included_src){
          included = included_src.included;
        } else {
          self.included = [];
          resolve();
        }
      } else {
        // assume the included_src is the included array;
        included = included_src;
      }

      if(! _isArray(included)){
        reject(new Error("Included is not an array"))
      }

      let resp = included.reduce((acc, item, ix) => {
        if(self.validate_item(item)){
          let key = this.generate_key(item);
          acc[key] = item;
        }
        return acc
      }, {})

      self.included = resp
      resolve()
    })
  }

  deserialise(jsonapi) {
    let self = this;
    return new Promise((resolve, reject) => {
      if(jsonapi == null || !('data' in jsonapi)){
        reject("No data found")
      }

      self.process_included(jsonapi)
      .then(() => {
        if (_isArray(jsonapi.data)){
          resolve(
            Promise.all(
              jsonapi.data.map(item => self.get_object_attributes(item))
            )
          )
        } else if (_isPlainObject(jsonapi.data)) {
          resolve(
            self.get_object_attributes(jsonapi.data)
          )
        }
      })
    });
  }

}

module.exports = Deserialiser;
