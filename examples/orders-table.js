var rjmetrics = require("rjmetrics");
var client = new rjmetrics.Client(0, "your-api-key");

function syncOrder(client, order) {
  return client.pushData(
    "orders",
    {
      "keys": ["id"],
      "id": order.id,
      "user_id": order.user_id,
      "value": order.value,
      "sku": order.sku
    });
}

var orders = [
  {"id": 1, "user_id": 1, "value": 58.40,  "sku": "milky-white-suede-shoes"},
  {"id": 2, "user_id": 1, "value": 23.99,  "sku": "red-button-down-fleece"},
  {"id": 3, "user_id": 2, "value": 5.00,   "sku": "bottle-o-bubbles"},
  {"id": 4, "user_id": 3, "value": 120.01, "sku": "zebra-striped-game-boy"},
  {"id": 5, "user_id": 5, "value": 9.90  , "sku": "kitten-mittons"}
];

client.authenticate().then( function(data) {

  orders.forEach( function(order) {
    syncOrder(client, order).then( function(data) {
      console.log("Synced order with id " + order.id);
    }, function(error) {
      console.error("Failed to sync order with id " + order.id);
    })
  });

}).fail(function(err) {
  console.error("Failed to authenticate!");
});
