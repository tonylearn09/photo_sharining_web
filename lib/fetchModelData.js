var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/


function fetchModel(url) {
  return new Promise(function(resolve, reject) {
      //console.log(url);

      const request = new XMLHttpRequest();
      request.open("GET", url);
      request.send();

      request.onreadystatechange = function() {
          if (request.readyState != 4) {
              // do nothing if not done
              return;
          }

          if (request.status != 200) {
              reject({ status: request.status, 
                  statusText: request.statusText });
          } else {
              // On Success return:
              resolve({ data: JSON.parse(request.responseText) });
          }
      }


  });
}

export default fetchModel;
