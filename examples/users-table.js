var rjmetrics = require("rjmetrics");
var client = new rjmetrics.Client(0, "your-api-key");

function syncUser(client, user) {
  return client.pushData(
    // table named "users"
    "users",
    {
      // user_id is the unique key here, since each user should only
      // have one record in this table
      "keys": ["id"],
      "id": user.id,
      "email": user.email,
      "acquisition_source": user.acquisition_source
    });
}

// let's define some fake users
var users = [
  {id: 1, email: "joe@schmo.com", acquisition_source: "PPC"},
  {id: 2, email: "mike@smith.com", acquisition_source: "PPC"},
  {id: 3, email: "lorem@ipsum.com", acquisition_source: "Referral"},
  {id: 4, email: "george@vandelay.com", acquisition_source: "Organic"},
  {id: 5, email: "larry@google.com", acquisition_source: "Organic"},
];

// make sure the client is authenticated before we do anything
client.authenticate().then( function(data) {

  users.forEach( function(user) {
    syncUser(client, user).then( function(data) {
      console.log("Synced user with id " + user.id);
    }, function(error) {
      console.error("Failed to sync user with id " + user.id);
    })
  });

}).fail(function(err) {
  console.error("Failed to authenticate!");
});
