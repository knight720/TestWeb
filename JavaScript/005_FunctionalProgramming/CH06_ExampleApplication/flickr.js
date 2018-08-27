requirejs.config({
    paths: {
      ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
      jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min'
    }
  });
  
  require([
      'ramda',
      'jquery'
    ],
    function (_, $) {
      var trace = _.curry(function(tag, x) {
        console.log(tag, x);
        return x;
      });

      // app goes here
      var Impure = {
        getJSON: _.curry(function(callback, url) {
          $.getJSON(url, callback);
        }),
      
        setHtml: _.curry(function(sel, html) {
          $(sel).html(html);
        })
      };

      //
      var url = function (term) {
        return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' + term + '&format=json&jsoncallback=?';
      };

      //
      var app = _.compose(Impure.getJSON(trace("response")), url);

      app("cats");
    });