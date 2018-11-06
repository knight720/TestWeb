var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function main() {
    console.log('main()');

    callApi();
}

function callApi() {
    // Create a request variable and assign a new XMLHttpRequest object to it.
    var request = new XMLHttpRequest();

    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', 'https://ghibliapi.herokuapp.com/films', true);

    request.onload = function () {
        // Begin accessing JSON data here
        console.log('onload');
        console.log(this.status);
        //console.log(this.responseText);
        //console.log(request);

        var data = JSON.parse(this.responseText);

        if (request.status >= 200 && request.status < 400) {
            data.forEach(movie => {
                // Log each movie's title
                console.log(movie.title);
            });
          } else {
            console.log('error');
          }
    };
    
    // Send request
    request.send();
}

main();