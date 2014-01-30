var needle = require('needle');
var Q = require('q');

Array.prototype.chunk = function(chunkSize) {
	var array=this;
	return [].concat.apply([],
		array.map(function(elem,i) {
			return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
		})
	);
}

function Client(clientId, apiKey) {
	this.clientId = clientId;
	this.apiKey = apiKey;
}

Client.API_BASE = "https://connect.rjmetrics.com/v2";
Client.SANDBOX_BASE = "https://sandbox-connect.rjmetrics.com/v2";
Client.MAX_REQUEST_SIZE = 100;

Client.prototype.authenticate = function() {
	return this.pushData(
		"test",
		{"keys":["id"], "id": 1},
		Client.SANDBOX_BASE
	);
}

Client.prototype.pushData = function(tableName, data, baseUrl) {
	if(!(data instanceof Array))
		data = [data];

	var deferred = Q.defer();

	promises = data.chunk(Client.MAX_REQUEST_SIZE)
		.map(function(subArray) {
			return this.makeApiCall(tableName, subArray, baseUrl);
		}, this);

	Q.all(promises).then(function(promises) {
		var hasErrors = false;

		promises.forEach( function(el) {
			if(el.code != 201)
				hasErrors = true;
		});

		if(!hasErrors)
			deferred.resolve(promises);
		else
			deferred.reject(promises);
	}).fail(function(error) {
		deferred.reject(error);
	});

	return deferred.promise;
}

Client.prototype.makeApiCall = function(tableName, data, baseUrl) {
	if(baseUrl === undefined)
		baseUrl = Client.API_BASE;

	var fullUrl = baseUrl + "/client/" + this.clientId +
		"/table/" + tableName + "/data?apikey=" + this.apiKey;

	var deferred = Q.defer();

	needle.post(
		fullUrl,
		data,
		{
			json: true
		},
		function(error, response, body) {
			if(error)
				deferred.reject(error);
			else
				deferred.resolve({
					body: JSON.parse(body.toString()),
					code: response.statusCode
				});
		}
	)

	return deferred.promise;
}

exports.Client = Client;