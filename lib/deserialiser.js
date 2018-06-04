'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _isArray = require('lodash/isArray');
var _isPlainObject = require('lodash/isPlainObject');
var _assign = require('lodash/assign');

var Deserialiser = function () {
  function Deserialiser(options) {
    _classCallCheck(this, Deserialiser);

    this.options = options;
    this.included = null;
  }

  _createClass(Deserialiser, [{
    key: 'process_related_item',
    value: function process_related_item(relitem, chain) {
      var inc_key = this.generate_key(relitem);
      var relitem_res = null;

      if (this.included && inc_key in this.included) {

        // if the related item is present in the included section
        var relitem_inc = this.included[inc_key];
        relitem_res = this.extract_attributes(relitem_inc);
        if ('relationships' in relitem_inc) {
          this.process_relationships(relitem_inc.relationships, chain).then(function (resolved_relations) {
            return _assign(relitem_res, resolved_relations);
          });
        }
      } else {

        // the related item is not present in the included section
        relitem_res = this.extract_attributes(relitem);
      }
      return relitem_res;
    }
  }, {
    key: 'process_relationships',
    value: function process_relationships(relationships) {
      var chain = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var self = this;
      return new Promise(function (resolve, reject) {
        if (!_isPlainObject(relationships)) {
          reject(new Error("Relationships is not an object"));
        }

        var rel_types = Object.keys(relationships);
        var res = rel_types.reduce(function (acc, rel_type) {
          if (!('data' in relationships[rel_type])) return acc;

          var reldat = relationships[rel_type].data;

          if (_isPlainObject(reldat)) {
            var relkey = self.generate_key(reldat);
            if (!(relkey in chain)) {
              var chain_copy = Object.assign({}, chain);
              chain_copy[relkey] = true;
              acc[rel_type] = self.process_related_item(reldat, chain_copy);
            }
          } else if (_isArray(reldat)) {
            acc[rel_type] = reldat.filter(function (r) {
              return !(self.generate_key(r) in chain);
            }).map(function (r) {
              var relkey = self.generate_key(r);
              var chain_copy = Object.assign({}, chain);
              chain_copy[relkey] = true;
              return self.process_related_item(r, chain_copy);
            });
          }
          return acc;
        }, {});

        resolve(res);
      });
    }
  }, {
    key: 'generate_key',
    value: function generate_key(item) {
      return this.validate_item(item) ? item.id + '__' + item.type : 'invalid';
    }
  }, {
    key: 'validate_item',
    value: function validate_item(item) {
      return 'id' in item && 'type' in item;
    }
  }, {
    key: 'extract_attributes',
    value: function extract_attributes(item) {
      return _assign({ id: item.id, type: item.type }, item.attributes || {});
    }
  }, {
    key: 'process_item',
    value: function process_item(item) {
      var resp_obj = this.extract_attributes(item);

      if ('relationships' in item) {
        this.process_relationships(item.relationships).then(function (rels) {
          _assign(resp_obj, rels);
        });
      }
      return resp_obj;
    }
  }, {
    key: 'get_object_attributes',
    value: function get_object_attributes(obj) {
      var self = this;

      return new Promise(function (resolve, reject) {

        if (!self.validate_item(obj)) {
          reject(new Error("Invalid object" + JSON.stringify(obj)));
        }

        resolve(self.process_item(obj));
      });
    }
  }, {
    key: 'process_included',
    value: function process_included(jsonapi) {
      var self = this;
      return new Promise(function (resolve, reject) {

        // included already processed
        if (self.included !== null) resolve();

        // nothing to do with no input
        if (!jsonapi) resolve();

        // wrong input
        if (!_isPlainObject(jsonapi)) reject(new Error("JSONAPI is not an object"));

        var included = jsonapi.included;

        // no 'included'-section in jsonapi response
        if (!included) {
          self.included = {};
          resolve();
        }

        if (!_isArray(included)) {
          reject(new Error("Included is not an array"));
        }

        self.included = included.reduce(function (acc, item, ix) {
          if (self.validate_item(item)) {
            acc[self.generate_key(item)] = item;
          }
          return acc;
        }, {});

        resolve();
      });
    }
  }, {
    key: 'deserialise',
    value: function deserialise(jsonapi) {
      var self = this;
      return new Promise(function (resolve, reject) {
        if (jsonapi == null || !('data' in jsonapi)) {
          reject("No data found");
        }

        self.process_included(jsonapi).then(function () {
          if (_isArray(jsonapi.data)) {
            resolve(Promise.all(jsonapi.data.map(function (item) {
              return self.get_object_attributes(item);
            })));
          } else if (_isPlainObject(jsonapi.data)) {
            resolve(self.get_object_attributes(jsonapi.data));
          }
        });
      });
    }
  }]);

  return Deserialiser;
}();

module.exports = Deserialiser;