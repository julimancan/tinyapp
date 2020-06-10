const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())



const generateRandomString = () => {
  let result = "";
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLength = char.length;
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * charLength))
  }
  return result;
};

const findUserByEmail = email => {
  // const user = Object.values(userDatabase).find(userObj => userObj.email === email)
  //  return user;

  // loop through the userDatabase object
  for (let userId in userDatabase) {
    // compare the emails, if they match return the user obj
    if (userDatabase[userId].email === email) {
      return userDatabase[userId];
    }
  };
};


const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = findUserByEmail(email);

  // if we got a user back and the passwords match then return the userObj
  if (user && user.password === password) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



const userDatabase = {};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const currentUser = userDatabase[userId];
  let templateVars = {
    urls: urlDatabase, currentUser: currentUser,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const currentUser = userDatabase[userId];
  let templateVars = { currentUser: currentUser };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { currentUser: null };
  res.render('urls_register', templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { currentUser: null };
  res.render('urls_login', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const userId = req.cookies['user_id'];
    const currentUser = userDatabase[userId];
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      currentUser: currentUser
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/urls");
  };
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (!urlDatabase[req.params.shortURL].startsWith('http')) {
    longURL = `http://${urlDatabase[req.params.shortURL]}`;
  };
  res.redirect(longURL);
});








app.post("/login-button", (req, res) => {
  res.redirect('/login');
});

app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password);
  console.log(user)

  if (user) {
    res.cookie('user_id', email)
    res.redirect("/urls");
  } else {
    res.status(401).send('Wrong credentials!');
  }
});


app.post("/urls", (req, res) => {
  console.log(req.body);
  const newUrl = generateRandomString();
  urlDatabase[newUrl] = req.body.longURL;
  res.redirect(`/urls/${newUrl}`);
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie('user_id', null);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {

  const userId = Math.random().toString(36).substring(2, 8);
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const newUser = { userId, name, email, password };
  const user = findUserByEmail(email)
  if (!email || !password) {
    res.status(400).send("email and/or password are invalid")
  } else if (user) {
    res.status(400) / send("email is already registered")
  } else {
    userDatabase[userId] = newUser;
    console.log(userDatabase);
    res.cookie("user_id", userId);
    res.redirect("/urls");
  };
});



app.post("/urls/:shortURL", (req, res) => {
  const urlToUpdate = req.params.shortURL;
  const newUrl = req.body.longURL;
  urlDatabase[urlToUpdate] = newUrl;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});










app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
