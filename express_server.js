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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


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
  let templateVars = {
    urls: urlDatabase, username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/urls")
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  if (!urlDatabase[req.params.shortURL].startsWith('http')) {
    longURL = `http://${urlDatabase[req.params.shortURL]}`;
  };
  res.redirect(longURL);
});








app.post("/urls/login", (req, res) => {
  console.log(req.body);
  res.cookie("username", req.body.username)
  res.redirect('/urls');
});


app.post("/urls", (req, res) => {
  console.log(req.body);
  const newUrl = generateRandomString();
  urlDatabase[newUrl] = req.body.longURL;
  res.redirect(`/urls/${newUrl}`);
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const urlToUpdate = req.params.shortURL;
  const newUrl = req.body.longURL;
  urlDatabase[urlToUpdate] = newUrl;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`)
});










app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
