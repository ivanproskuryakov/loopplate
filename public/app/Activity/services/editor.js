'use strict';

define([
  'app',
  'medium-editor',
], function (app, MediumEditor) {
  angular.module('app')
    .service('editorService', [function () {
      return {
        getHTML: function () {
          return $('#editable').html();
        },
        init: function () {

          var id = document.getElementById('editable');

          var editor = new MediumEditor(id, {
            toolbar: {
              allowMultiParagraphSelection: true,
              buttons: ['bold', 'italic', 'underline', 'anchor', 'h2', 'quote'],
              diffLeft: 0,
              diffTop: -10,
              firstButtonClass: 'medium-editor-button-first',
              lastButtonClass: 'medium-editor-button-last',
              relativeContainer: null,
              standardizeSelectionStart: false,
              static: false,
              align: 'center',
              sticky: true,
              updateOnEmptySelection: false
            },
            placeholder: {
              text: 'Whats on your mind?',
              hideOnClick: true
            }
          });
        }
      };
    }]);
});
