"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Http = require("http");
const Url = require("url");
const Mongo = require("mongodb");
let port = Number(process.env.PORT);
let databaseUrl = "mongodb+srv://test:passwort@kateseiswelt.bniiq.mongodb.net/KatesEiswelt?retryWrites=true&w=majority";
let itemsCollection;
if (!port) {
    port = 8100;
}
serverInit(port);
async function serverInit(_port) {
    let server = Http.createServer();
    await connectToDB(databaseUrl);
    server.addListener("request", handleRequest);
    server.addListener("listening", function () {
        console.log("listening on Port: " + _port);
    });
    server.listen(_port);
}
async function connectToDB(_url) {
    let mongoClient = new Mongo.MongoClient(_url, { useUnifiedTopology: true });
    await mongoClient.connect();
    if (mongoClient.isConnected()) {
        console.log("DB is connected");
    }
    itemsCollection = mongoClient.db("AstaVerleih").collection("Items");
}
async function handleRequest(req, res) {
    console.log(req.method);
    if (req.method === "POST") {
        handleReservierung(req, res);
    }
    else if (req.method === "GET") {
        if (req.url) {
            let idRegEx = new RegExp("item\/id\/[0-9a-fA-F]{24}$");
            let url = Url.parse(req.url, true);
            if (url.pathname === "/items") {
                getItems(res);
            }
            else if (idRegEx.test(url.pathname.toString())) {
                getItem(res, url);
            }
            else if (url.pathname.match(/statusAendern\/[0-9a-fA-F]{24}/)) {
                updateStatus(res, url);
            }
        }
    }
}
async function getItems(res) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    let itemsCursor = await itemsCollection.find();
    let itemsArray = await itemsCursor.toArray();
    res.write(JSON.stringify(itemsArray));
    res.end();
}
async function getItem(res, url) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    let pathnameArray = url.pathname.split("/");
    let id = new Mongo.ObjectId(pathnameArray[3]);
    let itemsCursor = await itemsCollection.find({ _id: id });
    let itemsArray = await itemsCursor.toArray();
    res.write(JSON.stringify(itemsArray[0]));
    res.end();
}
async function handleReservierung(req, res) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        let reservierung = JSON.parse(body);
        await updateDbReservierungen(reservierung);
        res.end();
    });
}
async function updateDbReservierungen(reservierung) {
    reservierung.ids.forEach((element) => {
        let id = new Mongo.ObjectID(element.toString());
        itemsCollection.updateOne({ "_id": id }, { $set: { "Status": "reserviert", "ausgeliehenAn": reservierung.name } });
    });
}
async function updateStatus(res, url) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    let pathnameArray = url.pathname.split("/");
    let id = new Mongo.ObjectId(pathnameArray[2]);
    let itemsCursor = await itemsCollection.find({ _id: id });
    let itemsArray = await itemsCursor.toArray();
    let item = JSON.parse(JSON.stringify(itemsArray[0]));
    if (item.Status === "reserviert") {
        itemsCollection.updateOne({ "_id": id }, { $set: { "Status": "ausgeliehen" } });
    }
    else if (item.Status === "ausgeliehen") {
        itemsCollection.updateOne({ "_id": id }, { $set: { "Status": "frei", "ausgeliehenAn": "" } });
    }
    res.end();
}
//# sourceMappingURL=index.js.map