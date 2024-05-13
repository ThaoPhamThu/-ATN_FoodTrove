const mongoose = require('mongoose');


const connectDatabase = () => {
    mongoose.connect('mongodb://phamthuthao-foodtrove:123456@localhost:27018/', {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
};

module.exports = connectDatabase;