require("../src/ui-codemirror");

var app = angular.module('x', ['ui.codemirror']);


app.controller('CodemirrorCtrl', ['$scope', function($scope) {

  $scope.piecesOfCode = [
    {
      code: ";; Scheme code in here.\n" +
            "(define (double x)\n\t(* x x))\n",
      options: {mode: "scheme", lineNumbers: true, indentWithTabs: true}
    },
    {
      code: '<!-- XML code in here. -->\n' +
            '<root>\n\t<foo>\n\t</foo>\n\t<bar/>\n</root>',
      options: {mode: "xml", lineNumbers: true, indentWithTabs: true}
    },
    {
      code: '// Javascript code in here.\n' +
            'function foo(msg) {\n\tvar r = Math.random();\n\treturn "" + r + " : " + msg;\n}',
      options: {mode: "javascript", lineNumbers: true, indentWithTabs: true}
    }
    ];

}]);
