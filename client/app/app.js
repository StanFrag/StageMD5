'use strict';

angular.module('md5App', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'ngCsvImport',
  'angular-loading-bar',
  'ngAnimate'
])

.config(function ($routeProvider, $locationProvider, cfpLoadingBarProvider) {

  $routeProvider
    .otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);

  cfpLoadingBarProvider.includeSpinner = true;
  cfpLoadingBarProvider.includeBar = true;
  
})