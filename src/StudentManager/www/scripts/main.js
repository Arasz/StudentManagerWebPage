requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'scripts/',
});

require(['dependencies/jquery', 'dependencies/knockout', 'mainViewModel', 'dependencies/domReady!'], function ($, ko, mainViewModel) {
    ko.applyBindings(new mainViewModel());
});