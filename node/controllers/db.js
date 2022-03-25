
const mongoose = require('mongoose')

const buzzwordSchema = new mongoose.Schema({
    buzzword: String,
    taken: Boolean
});
//TODO: add entry schema
const dbUrl = 'mongodb://127.0.0.1:27017'
const dbName = 'retro'

exports.populateBuzzwords= async function(){
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    // populate db with buzzwords:
    const buzzwords = [ 'cloud', 'ai', 'edge', 'hardware', 'release', 'success', 'win', 'note', 'mesh', 'sky', 'sun', 'interface']
    buzzwords.forEach(async function(word, _, _){
        const buzzword = new Buzzword({buzzword: word, taken: false})
        await buzzword.save()
    })
}

exports.getBuzzwords = async function(){
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    var populated = await Buzzword.find();
    console.log(populated)
}

//TODO: get a buzzword that is not used by anyone
//TODO: this function needs to accept a callback, to return the buzzword to, the callback would send a reponse to the client sending him to the specific game page and informing him of the buzzword
exports.getFreeBuzzword = async function(){
    await mongoose.connect(dbUrl + '/' + dbName)
    const Buzzword = mongoose.model('Buzzword', buzzwordSchema, 'buzzwords');

    var buzzwords = await Buzzword.find({taken: false});
    const randomIndex = Math.floor(Math.random() * buzzwords.length);
    console.log(randomIndex, buzzwords[randomIndex])
    //TODO: lock the buzzword up for an ammount of time (set taken to true and expiry date (needs expiry date to be introduced first))
}

//TODO: look through all buzzword trying to find expired ones, then free them up (will need to clear the entries also, so for later)