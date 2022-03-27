
const mongoose = require('mongoose');
const moment = require('moment');

const buzzwordSchema = new mongoose.Schema({
    buzzword: String,
    taken: Boolean,
    expiryDate: Date
});

//TODO: add entry schema
const dbUrl = 'mongodb://127.0.0.1:27017'
const dbName = 'retro'

exports.populateBuzzwords= async function(){
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');
    // if the db is already populated, first remove old entries
    Buzzword.deleteMany({}, function(err){
        console.log("Removed old entries");
    });

    // populate db with buzzwords:
    const buzzwords = [ 'cloud', 'ai', 'edge', 'hardware', 'release', 'success', 'win', 'note', 'mesh', 'sky', 'sun', 'interface']
    buzzwords.forEach(async function(word, _, _){
        const buzzword = new Buzzword({buzzword: word, taken: false},{timestamps:false});
        await buzzword.save();
    })
}

exports.getBuzzwords = async function(){
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    var populated = await Buzzword.find();
    console.log(populated)
}

exports.getNewBuzzword = async function(callback){
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    var buzzwords = await Buzzword.find({taken: false});
    const randomIndex = Math.floor(Math.random() * buzzwords.length);
    console.log('New buzzword picked with index: ', randomIndex, ': ', buzzwords[randomIndex]);
    var pickedBuzzword = buzzwords[randomIndex].buzzword;
    callback(pickedBuzzword);

    // updating the buzzword entry (locking it up)
    console.log(Buzzword.find({buzzword: pickedBuzzword}));
    var expiry = moment()
    expiry.add(15, 's');
    Buzzword.findOneAndUpdate({buzzword: pickedBuzzword}, {buzzword: pickedBuzzword, taken: true, expiryDate: expiry}, { new: true, timestamps: false},
        function(err, updated){
            if(err){
                console.log(err);
            } else {
                console.log(updated);
            }
    });
}

setInterval(async function() {
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');
    var now = moment();
    Buzzword.findOneAndUpdate({taken: true, expiryDate: {$lte: now}}, {taken: false}, {},
        function(err, doc) { 
            if (doc != null){
                console.log('Cleaning the DB: updated: ', doc.buzzword)
            }
    });
    //TODO: also clean the entries
}, 1*1000)
// format for the interval would be minutes * seconds * miliseconds