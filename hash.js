const bcrypt = require("bcrypt");

const password = "portfolioAdmin2026";

bcrypt.hash(password, 10).then(hash => {
  console.log(hash);
});