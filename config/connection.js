const { MongoClient } = require("mongodb");
var db = null;
const url =
  "mongodb+srv://adarshvillasuni:O2b4EO3PmhYe7dqR@cluster0.qgbn3co.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);
const dbName = "classroom";

module.exports.connect = function () {
  client.connect();
  return console.log("Connected successfully to server");
};

module.exports.get = function () {
  db = client.db(dbName);
  return db;
};
 