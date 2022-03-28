
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

const dbUrl = 'mongodb://127.0.0.1:27017'
const dbName = 'retro'

exports.clearEntries = async function () {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Entry = mongoose.model('Entry', entrySchema, 'entries');

    Entry.deleteMany({}, function (err) {
        //console.log("Removed old entries");
        if (err) {
            console.log(err);
        }
    });
}
exports.clearBuzzwords = async function () {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    Buzzword.deleteMany({}, function (err) {
        //console.log("Removed old buzzwords");
        if (err) {
            console.log(err);
        }
    });
}

exports.addEntry = async function (author, buzzword, category, contents, callback) {
    await mongoose.connect(dbUrl + '/' + dbName);
    const Entry = mongoose.model('Entry', entrySchema, 'entries');

    const newEntry = new Entry({ contents: contents, category: category, author: author, buzzword: buzzword });
    newEntry.save();
    callback(category);
}

exports.getGameEntriesByCategory = async function (buzzword, category, callback) {
    await mongoose.connect(dbUrl + '/' + dbName);
    const Entry = mongoose.model('Entry', entrySchema, 'entries');

    var simlpeEntries = [];
    Entry.find({ buzzword: buzzword, category: category },
        function (err, entries) {
            if (err) {
                console.log("ERR: ", err);
                return;
            }
            //console.log("Found entries: ", entries.length);
            entries.forEach(entry => {
                simlpeEntries.push({
                    id: entry.id,
                    author: entry.author,
                    buzzword: entry.buzzword,
                    contents: entry.contents
                })
            })
            callback(simlpeEntries);
        });
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
exports.checkIfBuzzwordOwner = async function (word, user, callback) {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    //console.log("Trying to find buzzword: ", word);
    var buzzword = await Buzzword.findOne({ buzzword: word });
    //console.log("Checking if User: ", user, " is owner of: ", word, " owner is: ", buzzword.ownerUser);
    if (buzzword == null) {
        callback(false);
        return;
    }
    if (buzzword.taken && buzzword.ownerUser == user) {
        callback(true);
        return;
    }
    callback(false);
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
exports.getBuzzwordisActive = async function (word, callback) {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    var buzzword = await Buzzword.findOne({ buzzword: word, taken: true });

    //console.log('Checking the status for buzzword: ', word);
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
    //console.log('New buzzword picked with index: ', randomIndex, ': ', buzzwords[randomIndex]);
    var pickedBuzzword = buzzwords[randomIndex].buzzword;
    callback(pickedBuzzword);

    // updating the buzzword entry (locking it up) - set current date with added timeout
    //console.log(Buzzword.find({ buzzword: pickedBuzzword }));
    var expiry = moment()
    expiry.add(30, 'h'); //TODO: set this timeout to something like 6h for production
    Buzzword.findOneAndUpdate({ buzzword: pickedBuzzword }, { buzzword: pickedBuzzword, taken: true, expiryDate: expiry, ownerUser: user, game: game }, { new: true, timestamps: false },
        function (err, updated) {
            if (err) {
                console.log(err);
            } else {
                console.log(updated);
            }
        });
}
exports.invalidateBuzzword = async function (user, buzzword, callback) {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');
    const Entry = mongoose.model('Entry', entrySchema, 'entries');

    var findBuzzword = await Buzzword.findOne({ buzzword: buzzword });
    if (findBuzzword.ownerUser != user) {
        callback(false);
        return;
    }
    //console.log("user confirmed to be owner")
    Buzzword.findOneAndUpdate({ buzzword: buzzword }, { taken: false, ownerUser: '' }, {},
        function (err, doc) {
            if (err) {
                console.log("ERR: ", err);
            }
            //console.log("query callback run, trying to find buzzword: ", buzzword, " From user: ", user);
            if (doc != null) {
                console.log('Cleaning the DB: updated: ', doc.buzzword);
                Entry.deleteMany({ buzzword: doc.buzzword }, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
    callback(true);
}

setInterval(async function () {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');
    const Entry = mongoose.model('Entry', entrySchema, 'entries');

    var now = moment();
    Buzzword.findOneAndUpdate({ taken: true, expiryDate: { $lte: now } }, { taken: false, ownerUser: '' }, {},
        function (err, doc) {
            if (doc != null) {
                //console.log('Cleaning the DB: updated: ', doc.buzzword);
                Entry.deleteMany({ buzzword: doc.buzzword }, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
}, 1 * 1000) //TODO: set this timeout to run every minute for production
// format for the interval would be minutes * seconds * miliseconds