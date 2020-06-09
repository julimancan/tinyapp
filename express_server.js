const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));


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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  } else {
    // this is a future step.
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

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`)
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const newUrl = generateRandomString();
  urlDatabase[newUrl] = req.body.longURL;
  res.redirect(`/urls/${newUrl}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
