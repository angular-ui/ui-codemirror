
angular.module('doc.ui-codeMirror', ['ui.codemirror', 'prettifyDirective' ])
  .controller('CodemirrorCtrl', ['$scope', function ($scope) {
    $scope.codeMirrorModel = "CodeMirror Hello World";
  }])