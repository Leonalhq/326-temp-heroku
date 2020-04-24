"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Database {
    constructor() {
        this.MongoClient = require('mongodb').MongoClient;
        this.uri = "mongodb+srv://guest:guest@cluster0-y0tyl.mongodb.net/test?retryWrites=true&w=majority";
        this.dbName = "dialectDictionary";
        this.client = new this.MongoClient(this.uri, { useNewUrlParser: true });
        (() => __awaiter(this, void 0, void 0, function* () {
            yield this.client.connect().catch(err => { console.log(err); });
        }))();
    }
    create(word, img, languages, definition) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.client.db(this.dbName);
            let wordCollection = db.collection('wordCollection');
            let defCollection = db.collection('defCollection');
            let lang = [];
            if (languages !== '') {
                lang.push(languages);
            }
            let doc = {
                'word': word,
                'img': img,
                'languages': lang,
            };
            yield wordCollection.insertOne(doc);
            if (languages !== '') {
                let defdoc = {
                    'word': word
                };
                defdoc[languages] = definition;
                yield defCollection.insertOne(defdoc);
            }
            console.log("create: word = " + word);
        });
    }
    //only work on update session
    def(word, lang, def) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.client.db(this.dbName);
            let wordCollection = db.collection('wordCollection');
            let defCollection = db.collection('defCollection');
            let info = yield wordCollection.findOne({ 'word': word });
            let curlanguage = info['languages'];
            if (curlanguage.includes(lang)) {
                console.log("already exists language!");
                return null;
            }
            curlanguage.push(lang);
            yield wordCollection.updateOne({ 'word': word }, { $set: { 'languages': curlanguage } }, { 'upsert': true });
            let pair = JSON.parse('{' + '"' + lang + '"' + ':' + '"' + def + '"' + '}');
            console.log('pair:' + JSON.stringify(pair));
            yield defCollection.updateOne({ 'word': word }, { $set: pair }, { 'upsert': true });
        });
    }
    get(word) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.client.db(this.dbName);
            let wordCollection = db.collection('wordCollection');
            console.log("get: word = " + word);
            let result = yield wordCollection.findOne({ 'word': word });
            console.log("get: returned " + JSON.stringify(result));
            if (result) {
                return result;
            }
            else {
                return null;
            }
        });
    }
    getDef(word, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.client.db(this.dbName);
            let defCollection = db.collection('defCollection');
            console.log("get: word = " + word + " language: " + lang);
            let result = yield defCollection.findOne({ 'word': word });
            console.log("getDef: returned " + JSON.stringify(result));
            if (result) {
                return result;
            }
            else {
                return null;
            }
        });
    }
    del(word) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.client.db(this.dbName);
            let wordCollection = db.collection('wordCollection');
            let defCollection = db.collection('defCollection');
            console.log("delete: word = " + word);
            let result = yield wordCollection.deleteMany({ 'word': word });
            yield defCollection.deleteMany({ 'word': word });
            console.log("result = " + result);
        });
    }
    addPron(ID, word, pronunciation, addr, lang, spelling) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.client.db(this.dbName);
            let pronCollection = db.collection('pronCollection');
            console.log("add pronunciation in " + addr + " to word " + word);
            let result = yield pronCollection.updateOne({ 'id': ID }, { $set: { 'word': word, 'pronunciation': pronunciation, 'address': addr, 'language': lang, 'spelling': spelling } }, { 'upsert': true });
            console.log(JSON.stringify(result));
        });
    }
    delPron(ID) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.client.db(this.dbName);
            let pronCollection = db.collection('pronCollection');
            console.log("delete pronunciation with ID " + ID);
            let result = yield pronCollection.deleteMany({ 'id': ID });
            console.log("result = " + JSON.stringify(result));
        });
    }
    initializeID() {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.client.db(this.dbName);
            let IDCollection = db.collection('IDCollection');
            IDCollection.updateOne({ 'type': 'user' }, { $set: { 'id': 0 } }, { 'upsert': true });
            IDCollection.updateOne({ 'type': 'pronunciatIon' }, { $set: { 'id': 0 } }, { 'upsert': true });
        });
    }
    getNewPronID() {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.client.db(this.dbName);
            let IDCollection = db.collection('IDCollection');
            let result = yield IDCollection.findOne({ 'type': 'pronunciatIon' });
            let newID = result['id'];
            yield IDCollection.updateOne({ 'type': 'pronunciatIon' }, { $set: { 'id': newID + 1 } }, { 'upsert': true });
            return newID;
        });
    }
    getNewUserID() {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.client.db(this.dbName);
            let IDCollection = db.collection('IDCollection');
            let result = yield IDCollection.findOne({ 'type': 'pronunciatIon' });
            let newID = result['id'];
            yield IDCollection.updateOne({ 'type': 'user' }, { $set: { 'id': newID + 1 } }, { 'upsert': true });
            return newID;
        });
    }
    isFound(word) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("isFound: word = " + word);
            let v = yield this.get(word);
            console.log("is found result = " + v);
            if (v === null) {
                return false;
            }
            else {
                return true;
            }
        });
    }
}
exports.Database = Database;
