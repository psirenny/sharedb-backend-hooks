'use strict';

var _ = require('lodash');

function Events(backend) {
  this.backend = backend;
  this.hookTree = {};
  this.setup();
}

Events.prototype.setup = function () {
  var self = this;

  function walk(path, collection, documentId, captures, fnResults, hookNode, newDataNode, oldDataNode) {
    _.forEach(hookNode, function (childHookNode, childHookNodeKey) {
      if (childHookNodeKey === '.hooks') {
        if (newDataNode === oldDataNode) return;
        var fns = childHookNode;
        var childCaptures = captures.concat([newDataNode, oldDataNode]);

        fns.forEach(function (fn) {
          var fnResult = fnResults[fn.id];
          if (fnResult) return fnResult.captureCollection.push(childCaptures);
          fnResults[fn.id] = {fn: fn, collection: collection, documentId: documentId, captureCollection: [childCaptures]};
        });
      } else if (childHookNodeKey === '*') {
        var newChildDataNodeKeys = typeof newDataNode === 'object' ? Object.keys(newDataNode) : [];
        var oldChildDataNodeKeys = typeof oldDataNode === 'object' ? Object.keys(oldDataNode) : [];
        var childDataNodeKeys = _.union(newChildDataNodeKeys, oldChildDataNodeKeys);

        childDataNodeKeys.forEach(function (childDataNodeKey) {
          var newChildDataNode = newDataNode ? newDataNode[childDataNodeKey] : undefined;
          var oldChildDataNode = oldDataNode ? oldDataNode[childDataNodeKey] : undefined;

          if (typeof newChildDataNode === 'object' || typeof oldChildDataNode === 'object') {
            var childPath = path.concat(childDataNodeKey);
            var childCollection = collection;
            var childDocumentId = documentId;
            var childCaptures = captures;

            if (path.length === 0) childCollection = childDataNodeKey;
            else if (path.length === 1) childDocumentId = childDataNodeKey;
            else childCaptures = childCaptures.concat(childDataNodeKey);
            walk(childPath, childCollection, childDocumentId, childCaptures, fnResults, childHookNode, newChildDataNode, oldChildDataNode);
          }
        });
      } else {
        var newChildDataNode = newDataNode ? newDataNode[childHookNodeKey] : undefined;
        var oldChildDataNode = oldDataNode ? oldDataNode[childHookNodeKey] : undefined;

        if (typeof childHookNode === 'object') {
          var childPath = path.concat(childHookNodeKey);
          walk(childPath, collection, documentId, captures, fnResults, childHookNode, newChildDataNode, oldChildDataNode);
        }
      }
    });
  }

  this.backend.use('after submit', function (shareReq, next) {
    next();
    var collection = shareReq.collection || shareReq.projection;
    var documentId = shareReq.id;
    var documentData = shareReq.snapshot.data;
    var basePath = [collection, documentId];
    var oldDataTree;
    var newDataTree;
    var fnResults = {};
    documentData.id = shareReq.id;

    if (shareReq.op.create) {
      newDataTree = {};
      _.set(newDataTree, basePath, documentData);
    } else if (!shareReq.op.del) {
      oldDataTree = {};
      newDataTree = {};

      shareReq.op.op.forEach(function (op) {
        var p = op.p;
        var path = basePath.concat(op.p);
        var index;
        var value;

        if (op.od || op.oi) {
          if (op.od) _.set(oldDataTree, path, op.od);
          if (op.oi) _.set(newDataTree, path, op.oi);
          return;
        }

        if (op.na) {
          value = _.get(documentData, op.p);
          _.set(oldDataTree, path, value - op.na);
          _.set(newDataTree, path, value);
          return;
        }

        if (op.li && op.ld) {
          _.set(oldDataTree, path, op.ld);
          _.set(newDataTree, path, op.li);
          return;
        }

        if (op.si) {
          p.pop();
          index = path.pop();
          value = _.get(documentData, p);
          _.set(oldDataTree, path, value.substring(0, index) + value.substr(index + op.si.length));
          _.set(newDataTree, path, value);
          return;
        }

        if (op.sd) {
          p.pop();
          index = path.pop();
          value = _.get(documentData, p);
          _.set(oldDataTree, path, value.substring(0, index) + op.sd + value.substr(index));
          _.set(newDataTree, path, value);
          return;
        }
      });
    }

    walk([], null, null, [], fnResults, self.hookTree, newDataTree, oldDataTree);
    _.each(fnResults, function (fnResult) {
      var params = [];
      if (fnResult.collection) params.push(fnResult.collection);
      if (fnResult.documentId) params.push(fnResult.documentId);
      if (fnResult.captureCollection[0].length === 2) params = params.concat(fnResult.captureCollection[0]);
      else params.push(fnResult.captureCollection);
      params.push(documentData);
      fnResult.fn.apply(fnResult.fn, params);
    });
  });
};

Events.prototype.on = function (type, pattern, callback) {
  var segments = pattern.split('.');
  var hooksPath = segments.concat('.hooks');
  var hooks = _.get(this.hookTree, hooksPath);
  var hook = function () { callback.apply(this, arguments); };
  hook.id = _.uniqueId();
  if (hooks) return hooks.push(hook);
  _.set(this.hookTree, hooksPath, [hook]);
};

module.exports = function (store) {
  return new Events(store);
};
