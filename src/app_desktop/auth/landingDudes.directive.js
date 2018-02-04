'use strict';

angular.module('feasyDesktop')
  .directive('landingDudes', function($rootScope) {
    return {
      restrict: 'E',
      'scope': {
        submitCallback: '=submit',
        config: '=',
        company: '=',
        deal: '='
      },
      templateUrl: function(elem, attrs) {
        return 'app_desktop/noAuth/dudes.component.html';
      },
      link: function(scope, elem, attrs) {
        var dudes = {
          aliG: {
            block: elem.find("#ali-g"),
            image: elem.find("#ali-g img"),
            proportion: 475 / 723,
            direction: "left",
            margin: 20,
            top: 45,
            top2: 27
          },

          neo: {
            block: elem.find("#neo"),
            image: elem.find("#neo img"),
            proportion: 621 / 673,
            direction: "right",
            margin: -35,
            top:85,
            top2: 50
          }
        };

        var resizeDude = function(dude) {

          if($("body").height() < 650) {
            dude.block.css("bottom", "45px");
            dude.block.css("top", dude.top2 + "px");
          } else {
            dude.block.css("bottom", "30px");
            dude.block.css("top", dude.top + "px");
          }

          var sideWidth = ($("body").width() - $("#content-block").width()) / 2 - dude.margin;
          console.log(dude.margin + ' ' + sideWidth);
          var proportion = dude.image.width() / dude.image.height();

          if(proportion != dude.proportion) {
            dude.image.width(dude.image.height() * dude.proportion);
          }

          if(dude.image.width() > sideWidth) {
            if(dude.direction == "right") {
              dude.block.css(dude.direction, "-5px");
            } else {
              dude.block.css(dude.direction, "-" + (dude.image.width() - sideWidth) + "px");
            }

          } else {
            dude.block.css(dude.direction, 0);
          }

          dude.block.width(sideWidth);
        };

        var resizeContent = function() {
          var diff = $("body").height() - $("#content-block").height();
          if(diff < 0) {
            $("#content-block").parent().css("padding-top", "20px");
          } else {
            $("#content-block").parent().css("padding-top", (diff / 2) + "px");
          }
        };

        var resizeAliG = function() {
          resizeDude(dudes.aliG);
        };

        var resizeNeo = function() {
          resizeDude(dudes.neo);
        };

        var resizeAll = function() {
          resizeAliG();
          resizeNeo();
        }

        dudes.aliG.image.load(function(e) {
          resizeAliG();
        });

        dudes.neo.image.load(function(e) {
          resizeNeo();
        });


        $(window).on("resize", resizeAll);
        $(window).on("resize", resizeContent);

        elem.on('$destroy', function() {
          $(window).off("resize", resizeAll);
          $(window).off("resize", resizeContent);

        });

        resizeContent();
      }
    };
  });
