myApp.service('dataService', ['$http', function($http) {

  return {
      getAll: function(url, callback) {
          var deferred = $q.defer();
          $http
              .get(url)
              .then(function (response) {
                  deferred.resolve(response.data);
              })
              .catch(function (e) {
                  deferred.reject(e);
                })
          return deferred.promise;
      }
  };
}]);
