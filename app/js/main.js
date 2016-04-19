(function() {
    var myMap, clusterer;

    new Promise(function(resolve) {
        ymaps.ready(resolve);
    }).then(function() {
        return new Promise(function(resolve) {
            myMap = new ymaps.Map("map", {
                center: [55.76, 37.64],
                zoom: 14
            });

            resolve(myMap);
        });
    }).then(function(myMap) {
        return new Promise(function(resolve, reject) {
            var xhrGet  = new XMLHttpRequest();
            var json = JSON.stringify({
              op: "all",
              // "review": {
              //   "coords": {"x": 55.76048, "y": 37.58335},
              //   "address": "Россия, Казань, Дом",
              //   "name": "Тест",
              //   "place": "Школа",
              //   "text": "тестовый отзыв",
              //   "date": "19.04.2016 22:45:00"
              // }
            });

            xhrGet.open("POST", "http://localhost:3000/");

            xhrGet.onload = function(e) {
                var data = JSON.parse(xhrGet.response);
                resolve(data);
            };
            xhrGet.onerror = function(e) {
                reject(new Error("somethink error"));
            };

            xhrGet.send(json);
        });
    }).then(function(data) {
        var source = document.getElementById("form-feedback").innerHTML;
        var templateFn = Handlebars.compile(source);
        var template = templateFn({feedbacksData: data});
        var result = document.querySelector(".results");

        result.innerHTML = template;

        return data;
    }).then(function(data) {
      var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        "<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>" +
        "<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>" +
        "<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>"
      );

      clusterer = new ymaps.Clusterer({
          clusterDisableClickZoom: true,
          clusterOpenBalloonOnClick: true,
          clusterBalloonContentLayout: 'cluster#balloonCarousel',
          clusterBalloonItemContentLayout: customItemContentLayout,
          clusterBalloonPanelMaxMapArea: 0,
          clusterBalloonContentLayoutWidth: 200,
          clusterBalloonContentLayoutHeight: 130,
          clusterBalloonPagerSize: 5
      });

      var feedbacksArr = Object.keys(data);
      var feedbacksList = [];

      var createPlacemark = function(coordsArr, addressArr, placeArr, textArr, dateArr) {
        // Устаналиваем данные, которые будут отображаться в балуне.
        return new ymaps.Placemark(coordsArr, {
           balloonContentHeader: placeArr,
           balloonContentBody: addressArr + ": " + textArr,
           balloonContentFooter: dateArr
         }, {
            preset: "islands#violetStretchyIcon"
          });
      };

      if(feedbacksArr.length > 0) {
        feedbacksArr.forEach(function(value, index) {
          data[value].forEach(function(k) {
            var coordsArr = [k.coords.x, k.coords.y];
            var addressArr = k.address;
            var placeArr = k.place;
            var textArr = k.text;
            var dateArr = k.date;

            feedbacksList.push(createPlacemark(coordsArr, addressArr, placeArr, textArr, dateArr));
          });
        });
      }

      clusterer.add(feedbacksList);
      var a=myMap.geoObjects.add(clusterer);
      console.log(clusterer)
    });
}());
