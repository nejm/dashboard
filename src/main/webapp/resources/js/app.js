var myApp = angular.module('plumbApp', ['ngResource','plumbApp.directives', 'ui.bootstrap', 'ui.slider', 'ngStorage', 'chart.js']);

jsPlumb.ready(function(){
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['plumbApp']);
    });

});
