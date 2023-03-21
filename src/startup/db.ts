const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

module.exports = function () {
  main().catch((err) => console.log(err));
};
