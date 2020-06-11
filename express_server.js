//port setting and middleware requirements
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieSession = require('cookie-session')

// setting ejs as template engine
app.set("view engine", "ejs");

// setting body parser & cookies.
app.use(bodyParser.urlencoded({ extended: true }));
// encrypted cookie.
app.use(cookieSession({
  name: 'session',
  keys: ['t4Hkbu5PuDutv42n26y5Y1rpg2CzdCSy', 'uLUTAJOFcWg4moaH7SxINyKT6b4iKJ3Q']
}));


// helper function to generate a random id.
const generateRandomString = () => {
  let result = "";
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLength = char.length;
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};


// helper function to fund an email in the userdatabase returns userid.
const findUserByEmail = (email, userDatabase) => {
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId];
    }
  }
};

// helper function to authenticate a user.
const authenticateUser = (email, password, userDatabase) => {
  const user = findUserByEmail(email, userDatabase);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};







// empty databases
const urlDatabase = {};
const userDatabase = {};




// GET SECTION


// sets the path for /urls if the user is logged in then render urls_index else ask the user to login.
app.get("/urls", (req, res) => {
  const userId = req.session['user_id'];
  const loggedUser = userDatabase[userId];

  let templateVars = {
    urlDatabase: urlDatabase[userId], currentUser: loggedUser
  };
  console.log("logged user: ", loggedUser)
  if (loggedUser) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }

});


//sets the path /urls/new where if a user is logged in they can submit a new long url else ask the user to login.
app.get("/urls/new", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = userDatabase[userId];
  let templateVars = { currentUser };

  if (userId) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


//sets the path for /register where a user can register.
app.get("/register", (req, res) => {
  let templateVars = { currentUser: null };
  res.render("urls_register", templateVars);
});


//sets the path for /login where a user can login to their account.
app.get("/login", (req, res) => {
  let templateVars = { currentUser: null };
  res.render('urls_login', templateVars);
});


//sets the path for /urls/shortURL where a user can edit a long url if they are logged in otherwise they're asked to login.
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = userDatabase[userId];
  let templateVars = currentUser;

  if (userId) {
    if (urlDatabase[userId][req.params.shortURL]) {
      templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[userId][req.params.shortURL],
        currentUser
      };
      res.render("urls_show", templateVars);
    } else {
      res.redirect("/urls");
    }
  } else {
    res.redirect("/login");
  }
});


//sets the public path /u/shorturl which will redirect everyone to the long url.
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = "";
  console.log("short url: ", shortURL)

  for (let user in userDatabase) {
    if (urlDatabase[user][shortURL]) {
      longURL = urlDatabase[user][shortURL];
      break;
    }
  } 
  if (!longURL) {
    res.status(400).send('Short URL not found!');
    return;
  }
  if (!longURL.startsWith('http')) {
    longURL = `http://${longURL}`;
  }
  res.redirect(longURL);
});







// POST SECTION


// sets the button to redirect to urls_login.
app.post("/login-button", (req, res) => {
  res.redirect('/login');
});


//logs a user in to their account.
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, userDatabase);

  if (user) {
    console.log(user)
    req.session.user_id = user.userId;
    res.redirect("/urls");
  } else {
    res.status(401).send('Wrong credentials!');
  }
});


//sets the button to edit a long URL and redirects to urls_show where a user can edit the URL if the user is logged in.
app.post("/urls", (req, res) => {
  const userId = req.session['user_id'];
  const newUrl = generateRandomString();

  if (!urlDatabase[userId]) {
    urlDatabase[userId] = {};
  }
  urlDatabase[userId][newUrl] = req.body.longURL;
  res.redirect(`/urls/${newUrl}`);
});


//logs a user out/ clears the cookies, and redirects to the login page.
app.post("/urls/logout", (req, res) => {
  req.session.user_id = null
  res.redirect("/login");
});


//sets the button on the registration path to create a new user if the user doesnt already exist, or if the email or password are invalid.
app.post("/register", (req, res) => {

  const userId = generateRandomString();
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const newUser = {
    userId, name, email, password: bcrypt.hashSync(password, saltRounds),
  };
  const user = findUserByEmail(email, userDatabase);
  if (!email || !password) {
    res.status(400).send("email and/or password are invalid");
  } else if (user) {
    res.status(400).send("email is already registered");
  } else {
    userDatabase[userId] = newUser;
    req.session['user_id'] = userId;
    console.log(userDatabase)
    res.redirect("/urls");
  }
});


//sets the path in urls_show so that the user can edit their long URL.
app.post("/urls/:shortURL", (req, res) => {
  const urlToUpdate = req.params.shortURL;
  const newUrl = req.body.longURL;
  urlDatabase[urlToUpdate] = newUrl;
  res.redirect('/urls');
});


//sets the path in urls to delete a url entry.
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session['user_id'];
  if (userId) {
    delete urlDatabase[userId][req.params.shortURL];
    res.redirect(`/urls/`);
  } else {
    res.redirect('/login');
  };

});







// sets a path where we can see the urlDatabase and the userDatabase for debugging purposes.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  res.json(userDatabase);
});

//starts the server listening on a specific port.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
