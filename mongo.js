const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}
const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@cluster0-rcvs5.mongodb.net/person-app?retryWrites=true`;

mongoose.connect(url, { useNewUrlParser: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length > 3) {
  const newName = process.argv[3];
  const newNumber = process.argv[4];

  const person = new Person({
    name: newName,
    number: newNumber
  });

  person.save().then(res => {
    console.log(`lisätään ${newName} numero ${newNumber} luetteloon`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then(result => {
    console.log("puhelinluettelo:");
    result.forEach(p => {
      console.log(`${p.name} ${p.number}`);
    });
    mongoose.connection.close();
  });
}
