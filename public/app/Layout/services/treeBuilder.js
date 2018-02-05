'use strict';

define(['app'], function (app) {
  angular.module('app')
    .factory('TreeBuilder', function () {

      function TreeBuilder(key, parentKey, childrenKey) {
        this.key = key;
        this.parentKey = parentKey;
        this.childrenKey = childrenKey;

        this.build = function (data) {
          var dataMap = data.reduce(function (map, node) {
            map[node[this.key]] = node;
            return map;
          }.bind(this), {});

          // create the tree array
          var treeData = [];
          data.forEach(function (node) {
            // add to parent
            var parent = dataMap[node[this.parentKey]];
            if (parent) {
              // create child array if it doesn't exist
              (parent[this.childrenKey] || (parent[this.childrenKey] = [])).push(node);
            } else {
              // parent is null or missing
              treeData.push(node);
            }
          }.bind(this));
          return treeData;
        }.bind(this);

        this.join = function (first, second) {
          if (first.length === 0) return second;
          if (second.length === 0) return first;

          var treeData = first;

          second.forEach(function (node) {
            var parent = this._findNodeByKey(treeData, node[this.parentKey], this.key, this.parentKey, this.childrenKey);
            if (parent) {
              (parent[this.childrenKey] || (parent[this.childrenKey] = [])).push(node);
            } else {
              treeData.push(node);
            }
          }.bind(this));

          return treeData;
        }.bind(this);

        this._findNodeByKey = function (tree, key) {
          if (!key) return undefined;

          for (var i in tree) {
            if (!tree.hasOwnProperty(i)) continue;

            var node = tree[i];

            if (node[this.key] === key) {
              return node;
            }

            if (node[this.childrenKey]) {
              var childNode = this._findNodeByKey(node[this.childrenKey], key, this.key, this.parentKey, this.childrenKey);
              if (childNode) {
                // if found child
                return childNode;
              }
            }
          }

          return undefined;
        }.bind(this);
      }

      return {
        /**
         * tree builder
         * @param {string} key name of key property
         * @param {string} parentKey name of parent key property
         * @param {string} childrenKey name of children key property
         * @returns {TreeBuilder}
         */
        create: function (key, parentKey, childrenKey) {
          return new TreeBuilder(key, parentKey, childrenKey);
        }
      };
    });
});
