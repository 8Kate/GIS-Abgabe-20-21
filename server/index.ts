import * as Http from "http";
import * as Url from "url";
import * as Mongo from "mongodb";


let port: number = Number (process.env.PORT);
let databaseUrl: string = "mongodb+srv://test:passwort@kateseiswelt.bniiq.mongodb.net/KatesEiswelt?retryWrites=true&w=majority";
let itemsCollection: Mongo.Collection;


if (!port) {
    port = 8100;
}

serverInit(port);

async function serverInit (_port: number): Promise<void> {
    let server: Http.Server = Http.createServer();
    await connectToDB(databaseUrl);
    
    server.addListener("request", handleRequest);
    
    server.addListener("listening", function (): void {
        console.log("listening on Port: " + _port);
    });

    server.listen(_port);
}

async function connectToDB (_url: string): Promise<void> {
    let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(_url, { useUnifiedTopology: true });
    await mongoClient.connect();
    
    if (mongoClient.isConnected()) {
        console.log("DB is connected");
    }

    itemsCollection = mongoClient.db("AstaVerleih").collection("Items");
}

async function handleRequest (req: Http.IncomingMessage, res: Http.ServerResponse): Promise<void> {
    console.log(req.method);
    if (req.method === "POST") {
        handleReservierung(req, res);
    } else if (req.method === "GET") {
        if (req.url) {
            let idRegEx: RegExp = new RegExp("item\/id\/[0-9a-fA-F]{24}$");
            let url: Url.UrlWithParsedQuery = Url.parse(req.url, true);
    
            if (url.pathname === "/items") {
                getItems(res);
            } else if (idRegEx.test(url.pathname.toString())) {
                getItem(res, url);
            } else if (url.pathname.match(/statusAendern\/[0-9a-fA-F]{24}/)) {
                updateStatus(res, url);
            }
        }
    } 
}

async function getItems (res: Http.ServerResponse): Promise<void> {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    let itemsCursor: Mongo.Cursor<string> = await itemsCollection.find();
    let itemsArray: string[] = await itemsCursor.toArray();
    res.write(JSON.stringify(itemsArray));
    res.end();
}

async function getItem (res: Http.ServerResponse, url: Url.UrlWithParsedQuery): Promise<void> {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let pathnameArray: string[] = url.pathname.split("/");
    let id: Mongo.ObjectId = new Mongo.ObjectId(pathnameArray[3]);

    let itemsCursor: Mongo.Cursor<string> = await itemsCollection.find({_id: id});
    let itemsArray: string[] = await itemsCursor.toArray();
    res.write(JSON.stringify(itemsArray[0]));
    res.end();
}

async function handleReservierung (req: Http.IncomingMessage, res: Http.ServerResponse): Promise<void> {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let body: string = "";
    req.on("data", chunk => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        let reservierung: Reservierungen = JSON.parse(body);
        await updateDbReservierungen(reservierung);
        res.end();
    });
} 

async function updateDbReservierungen (reservierung: Reservierungen): Promise<void> {
    reservierung.ids.forEach((element) => {
        let id: Mongo.ObjectID = new Mongo.ObjectID(element.toString());
        itemsCollection.updateOne({"_id": id}, {$set: {"Status": "reserviert", "ausgeliehenAn": reservierung.name}});
    });
}

async function updateStatus(res: Http.ServerResponse, url: Url.UrlWithParsedQuery): Promise<void> {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let pathnameArray: string[] = url.pathname.split("/");
    let id: Mongo.ObjectId = new Mongo.ObjectId(pathnameArray[2]);

    let itemsCursor: Mongo.Cursor<string> = await itemsCollection.find({_id: id});
    let itemsArray: string[] = await itemsCursor.toArray();
    let item: Item  = JSON.parse(JSON.stringify(itemsArray[0]));

    if (item.Status === "reserviert") {
        itemsCollection.updateOne({"_id": id}, {$set: {"Status": "ausgeliehen"}});
    } else if (item.Status === "ausgeliehen") {
        itemsCollection.updateOne({"_id": id}, {$set: {"Status": "frei", "ausgeliehenAn": ""}});
    }
    res.end();
}
