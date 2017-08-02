myApp.directive('keypressEvents', function ($document,$scope,$uibModal) {
    return {
        restrict: 'A',
        link: function () {
            $document.bind('keyup', function (e) {
                if (e.keyCode == 17) {
                    $uibModal.open({
                        templateUrl: '/Dashboard/resources/partials/json.html',
                        scope: $scope
                    });
                }
            });
        }
    }
});
