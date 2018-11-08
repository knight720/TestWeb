var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var dataUrl = 'http://data.ntpc.gov.tw/api/v1/rest/datastore/382000000A-000077-002';

function main() {
    console.log('main()');

    callApi();
}

function callApi() {
    // Create a request variable and assign a new XMLHttpRequest object to it.
    var request = new XMLHttpRequest();

    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', dataUrl, true);

    request.onload = function () {
        // Begin accessing JSON data here
        console.log('onload');
        console.log(this.status);
        //console.log(this.responseText);
        //console.log(request);

        var data = JSON.parse(this.responseText);
        console.log(data);

        if (request.status >= 200 && request.status < 400) {
            data.result.records.forEach(i => {
                // Log each movie's title
                console.log(i.date);
                var date = new Date(i.date);
                console.log(date);
            });
          } else {
            console.log('error');
          }
    };
    
    // Send request
    request.send();
}

main();