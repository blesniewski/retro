
const mongoose = require('mongoose');
const moment = require('moment');

const buzzwordSchema = new mongoose.Schema({
    buzzword: String,
    taken: Boolean,
    expiryDate: Date,
    ownerUser: String,
    game: String
});

const entrySchema = new mongoose.Schema({
    author: String,
    buzzword: String,
    category: String,
    contents: String
});

//TODO: add entry schema
const dbUrl = 'mongodb://127.0.0.1:27017'
const dbName = 'retro'

exports.clearEntries = async function () {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Entry = mongoose.model('Entry', entrySchema, 'entries');

    Entry.deleteMany({}, function (err) {
        console.log("Removed old entries");
    });
}
exports.clearBuzzwords = async function () {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    Buzzword.deleteMany({}, function (err) {
        console.log("Removed old buzzwords");
    });
}

exports.addEntry = async function (author, buzzword, category, contents, callback) {
    await mongoose.connect(dbUrl + '/' + dbName);
    const Entry = mongoose.model('Entry', entrySchema, 'entries');

    const newEntry = new Entry({ contents: contents, category: category, author: author, buzzword: buzzword });
    newEntry.save();
    callback(category);
}

exports.populateBuzzwords = async function () {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    // populate db with buzzwords:
    const buzzwords = ['cloud', 'ai', 'edge', 'hardware', 'release', 'success', 'win', 'note', 'mesh', 'sky', 'sun', 'interface']
    buzzwords.forEach(async function (word, _, _) {
        const buzzword = new Buzzword({ buzzword: word, taken: false }, { timestamps: false });
        await buzzword.save();
    })
}

exports.getBuzzwords = async function () {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    var populated = await Buzzword.find();
    console.log(populated)
}

exports.getBuzzword = async function (word, callback) {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    var buzzword = await Buzzword.findOne({ buzzword: word });

    console.log('Checking the status for buzzword: ', word);
    if (buzzword == null) {
        callback(word, false);
    }
    else if (buzzword.taken) {
        callback(word, true, buzzword.game)
    }
}

exports.getNewBuzzword = async function (game, user, callback) {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    var buzzwords = await Buzzword.find({ taken: false });
    const randomIndex = Math.floor(Math.random() * buzzwords.length);
    console.log('New buzzword picked with index: ', randomIndex, ': ', buzzwords[randomIndex]);
    var pickedBuzzword = buzzwords[randomIndex].buzzword;
    callback(pickedBuzzword);

    // updating the buzzword entry (locking it up) - set current date with added timeout
    console.log(Buzzword.find({ buzzword: pickedBuzzword }));
    var expiry = moment()
    expiry.add(15, 'm'); //TODO: set this timeout to something like 6h for production
    Buzzword.findOneAndUpdate({ buzzword: pickedBuzzword }, { buzzword: pickedBuzzword, taken: true, expiryDate: expiry, ownerUser: user, game: game }, { new: true, timestamps: false },
        function (err, updated) {
            if (err) {
                console.log(err);
            } else {
                console.log(updated);
            }
        });
}

setInterval(async function () {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');
    var now = moment();
    Buzzword.findOneAndUpdate({ taken: true, expiryDate: { $lte: now } }, { taken: false }, {},
        function (err, doc) {
            if (doc != null) {
                console.log('Cleaning the DB: updated: ', doc.buzzword)
            }
        });
    //TODO: also clean the entries
}, 1 * 1000) //TODO: set this timeout to run every minute for production
// format for the interval would be minutes * seconds * miliseconds