const bcrypt = require("bcrypt");

const getUserByEmail  = (email, userDatabase) => {
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId];
    }
  }
};

const authenticateUser = (email, password, userDatabase) => {
  const user = getUserByEmail (email, userDatabase);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

const generateRandomString = () => {
  let result = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charLength = char.length;
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};



module.exports = { getUserByEmail , authenticateUser, generateRandomString };