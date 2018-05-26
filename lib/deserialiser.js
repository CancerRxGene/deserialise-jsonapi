'use strict';

let _isArray = require('lodash/isArray')
let _isPlainObject = require('lodash/isPlainObject')
let _assign = require('lodash/assign')

class Deserialiser {

  constructor(options){
    this.options = options
  }

  validate_item(item) {
    if(!('id' in item) || !('type' in item)){
        return false
      }
    return true
  }

  process_item(item){
    let resp_obj = {id: item.id, type: item.type}
    if('attributes' in item){
      _assign(resp_obj, item.attributes)
    }
    return resp_obj
  }

  process_included(included){
    let self = this
    return new Promise((resolve, reject) => {
      if(! _isArray(included)){
        reject(new Error("Included is not an array"))
      }

      let resp = included.reduce((acc, item, ix) => {
        let key = (item.id || 'id_' + ix) + "_" + (item.type || '')

        if(self.validate_item(item)){
          acc[key] = item
        }
        return acc
      }, {})

      resolve(resp)
    })
  }

  get_object_attributes(obj){
    let self = this;

    return new Promise((resolve, reject) => {

      if(!self.validate_item(obj)){
        reject(new Error("Invalid object" + JSON.stringify(obj)))
      }

      let resp_obj = self.process_item(obj)
      resolve(resp_obj);

    })
  }

  deserialise(jsonapi) {
    return new Promise((resolve, reject) => {
      if(jsonapi == null | !('data' in jsonapi)){
        reject("No data found")
      }

      if (_isArray(jsonapi.data)){
        resolve({tst: "array"})
      } else if (_isPlainObject(jsonapi.data)) {
        resolve(this.get_object_attributes(jsonapi.data))
      }
    });
  }

}

module.exports = Deserialiser;
