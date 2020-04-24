'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const server_1 = require("./server");
const theDatabase = new database_1.Database(); // CHANGE THIS
const theServer = new server_1.Server(theDatabase);
theServer.listen(8080);
