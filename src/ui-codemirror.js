'use strict';

/**
 * Binds a CodeMirror widget to a <textarea> element.
 */
angular.module('ui.codemirror', [])
  .constant('uiCodemirrorConfig', {})
  .directive('uiCodemirror', ['uiCodemirrorConfig', function (uiCodemirrorConfig) {

    return {
      restrict: 'EA',
      require: '?ngModel',
      priority: 1,
      compile: function compile() {

        // Require CodeMirror
        if (angular.isUndefined(window.CodeMirror)) {
          throw new Error('ui-codemirror need CodeMirror to work... (o rly?)');
        }

        return function postLink(scope, iElement, iAttrs, ngModel) {


          var options, opts, codeMirror, value;

          value = iElement.text();

          if (iElement[0].tagName === 'TEXTAREA') {
            codeMirror = window.CodeMirror.fromTextArea(iElement[0], {
              value: value
            });
          } else {
            iElement.html('');
            codeMirror = new window.CodeMirror(function(cm_el) {
              iElement.replaceWith(cm_el);
            }, {
              value: value
            });
          }

          options = uiCodemirrorConfig.codemirror || {};
          opts = angular.extend({}, options, scope.$eval(iAttrs.uiCodemirror), scope.$eval(iAttrs.uiCodemirrorOpts));

          function updateOptions(newValues) {
            for (var key in newValues) {
              if (newValues.hasOwnProperty(key)) {
                codeMirror.setOption(key, newValues[key]);
              }
            }
          }

          updateOptions(opts);

          if (iAttrs.uiCodemirror) {
            scope.$watch(iAttrs.uiCodemirror, updateOptions, true);
          }
          // Specialize change event
          codeMirror.on('change', function (instance) {
            var newValue = instance.getValue();
            if (ngModel && newValue !== ngModel.$viewValue) {
              ngModel.$setViewValue(newValue);
            }
            if (!scope.$$phase) {
              scope.$apply();
            }
          });


          if (ngModel) {
            // CodeMirror expects a string, so make sure it gets one.
            // This does not change the model.
            ngModel.$formatters.push(function (value) {
              if (angular.isUndefined(value) || value === null) {
                return '';
              } else if (angular.isObject(value) || angular.isArray(value)) {
                throw new Error('ui-codemirror cannot use an object or an array as a model');
              }
              return value;
            });


            // Override the ngModelController $render method, which is what gets called when the model is updated.
            // This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
            ngModel.$render = function () {
              //Code mirror expects a string so make sure it gets one
              //Although the formatter have already done this, it can be possible that another formatter returns undefined (for example the required directive)
              var safeViewValue = ngModel.$viewValue || '';
              codeMirror.setValue(safeViewValue);
            };
          }


          // Watch ui-refresh and refresh the directive
          if (iAttrs.uiRefresh) {
            scope.$watch(iAttrs.uiRefresh, function (newVal, oldVal) {
              // Skip the initial watch firing
              if (newVal !== oldVal) {
                codeMirror.refresh();
              }
            });
          }

          // onLoad callback
          if (angular.isFunction(opts.onLoad)) {
            opts.onLoad(codeMirror);
          }

        };
      }
    };
  }]);
