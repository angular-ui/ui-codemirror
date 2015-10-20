'use strict';

/**
 * Binds a CodeMirror widget to a <textarea> element.
 */
angular.module('ui.codemirror', [])
  .constant('uiCodemirrorConfig', {})
  .directive('uiCodemirror', uiCodemirrorDirective);

/**
 * @ngInject
 */
function uiCodemirrorDirective($timeout, uiCodemirrorConfig) {

    return {
        restrict: 'EA',
        require: '?ngModel',
        scope: {
            model: '=ngModel'
        },
        link: postLink
    };

    function postLink(scope, iElement, iAttrs, ngModel) {

        // Require CodeMirror
        if (angular.isUndefined(window.CodeMirror)) {
            throw new Error('ui-codemirror needs CodeMirror to work... (o rly?)');
        }

        var codemirrorOptions = angular.extend(
          { value: iElement.text() },
          uiCodemirrorConfig.codemirror || {},
          scope.$eval(iAttrs.uiCodemirror),
          scope.$eval(iAttrs.uiCodemirrorOpts)
        );

        var codemirror = newCodemirrorEditor(iElement, codemirrorOptions);

        configOptionsWatcher(
          codemirror,
          iAttrs.uiCodemirror || iAttrs.uiCodemirrorOpts,
          scope
        );

        configNgModelLink(codemirror, ngModel, scope);

        configUiRefreshAttribute(codemirror, iAttrs.uiRefresh, scope);

        // Allow access to the CodeMirror instance through a broadcasted event
        // eg: $broadcast('CodeMirror', function(cm){...});
        scope.$on('CodeMirror', function (event, callback) {
            if (angular.isFunction(callback)) {
                callback(codemirror);
            } else {
                throw new Error('the CodeMirror event requires a callback function');
            }
        });

        // onLoad callback
        if (angular.isFunction(codemirrorOptions.onLoad)) {
            codemirrorOptions.onLoad(codemirror);
        }
    }

    function newCodemirrorEditor(iElement, codemirrorOptions) {
        var codemirrot;

        if (iElement[0].tagName === 'TEXTAREA') {
            // Might bug but still ...
            codemirrot = window.CodeMirror.fromTextArea(iElement[0], codemirrorOptions);
        } else {
            iElement.html('');
            codemirrot = new window.CodeMirror(function (cm_el) {
                iElement.append(cm_el);
            }, codemirrorOptions);
        }

        return codemirrot;
    }

    function configOptionsWatcher(codemirrot, uiCodemirrorAttr, scope) {
        if (!uiCodemirrorAttr) { return; }

        var codemirrorDefaultsKeys = Object.keys(window.CodeMirror.defaults);
        scope.$watch(uiCodemirrorAttr, updateOptions, true);
        function updateOptions(newValues, oldValue) {
            if (!angular.isObject(newValues)) { return; }
            codemirrorDefaultsKeys.forEach(function (key) {
                if (newValues.hasOwnProperty(key)) {

                    if (oldValue && newValues[key] === oldValue[key]) {
                        return;
                    }

                    codemirrot.setOption(key, newValues[key]);
                }
            });
        }
    }

    function configNgModelLink(codemirror, ngModel, scope) {
        if (!ngModel) { return; }
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

        scope.$watch('model', function () {
            //Code mirror expects a string so make sure it gets one
            //Although the formatter have already done this, it can be possible that another formatter returns undefined (for example the required directive)
            var safeValue = scope.model || '';
            codemirror.setValue(safeValue);
        });

        // Keep the ngModel in sync with changes from CodeMirror
        codemirror.on('change', function (instance) {
            var newValue = instance.getValue();
            if (newValue !== ngModel.$viewValue) {
                scope.model = newValue;
            }
        });
    }

    function configUiRefreshAttribute(codeMirror, uiRefreshAttr, scope) {
        if (!uiRefreshAttr) { return; }

        scope.$watch(uiRefreshAttr, function (newVal, oldVal) {
            // Skip the initial watch firing
            if (newVal !== oldVal) {
                $timeout(function () {
                    codeMirror.refresh();
                });
            }
        });
    }

}
