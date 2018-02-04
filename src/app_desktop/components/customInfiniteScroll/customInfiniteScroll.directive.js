'use strict';

angular.module('feasyDesktop')
  .directive('customInfiniteScroll', function($timeout) {
    return {
      restrict: 'A',
      //require: 'perfectScrollbar',
      scope: {
        item: '='
      },
      link: function(scope, elem, attrs) {
        var finished = false;
        var isPageLoading = false;

        scope.item.finish = function() {
          console.log("finished")
          elem.find(".infinite-loader").hide();
          finished = true;
        };

        scope.item.restart = function() {
          console.log("restarted");
          elem.find(".infinite-loader").show();
          elem.scrollTop(0);
          finished = false;
        };

        scope.item.update = function() {
          console.log("updated")

          $timeout(function() {
            elem.perfectScrollbar("update");
          }, 200);

        };

        var loadElements = function(topPct) {
          if(topPct >= 0.5 && isPageLoading == false) {
            isPageLoading = true;

            elem.find(".infinite-loader-error").hide();
            elem.find(".infinite-loader").show();

            scope.item.callback()
              .then(function (response) {
                isPageLoading = false;
              }, function (response) {
                isPageLoading = false;
                elem.find(".infinite-loader").hide();
                elem.find(".infinite-loader-error").show();
              });
          }
        };

        elem.on("scroll", function(e) {
          if(finished == false) {
            var height = elem.find("div:first").height();
            var offset = eval(elem.find(".ps-scrollbar-y-rail").css("top").replace("px", ""));

            loadElements(offset / height);
          }
        });

        elem.append('<div class="infinite-loader">\
          <div class="loader-inner">\
            <i class="fa fa-cog fa-spin"></i>\
            <br/>loading...\
          </div>\
        </div>');

        elem.append('<div class="infinite-loader-error">\
          <b>Oops, something was wrong.</b>\
          <br/> I could not load more letters.\
          <br/><a href="#" class="try-link">Please try again</a>\
        </div>');

        elem.find(".try-link").on("click", function(e) {
          e.preventDefault();

          loadElements(0.75);
        });
      }
    };
  });
