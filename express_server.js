const express = require("express");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const app = express();
const PORT = 8080;

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookies());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  res.render('urls_index', getTemplateVars(users[req.cookies.user_id], req));
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL].longURL = req.body.longURL;
  urlDatabase[newShortURL].userID = req.cookies.user_id;
  res.redirect('/urls/' + newShortURL);
});

app.get("/urls/new", (req, res) => {
  if(!req.cookies.user_id) res.redirect("/login");
  res.render("urls_new", getTemplateVars(users[req.cookies.user_id], req));
});

app.get("/urls/:shortURL", (req, res) => {
  res.render("urls_show", getTemplateVars(users[req.cookies.user_id], req));
});

app.get("/register", (req, res) => {
  res.render("register", getTemplateVars(users[req.cookies.user_id], req));
});

app.post("/register", (req, res) => {

  if(!req.body.email || !req.body.password || doesEmailExist(req.body.email, users)) res.sendStatus(400);

  const user = { id: generateRandomString(),
    email: req.body.email,
    password: req.body.password };

  users[user.id] = user;

  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  urlDatabase[req.params.shortURL].userID = req.cookies.user_id;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  res.render("login", getTemplateVars(users[req.cookies.user_id], req));
});

app.post("/login", (req, res) => {
  if(!doesEmailExist(req.body.email, users)) res.sendStatus(403);

  const currentUser = users[doesEmailExist(req.body.email, users)];
  if(req.body.password !== currentUser.password) res.sendStatus(403);

  res.cookie('user_id', currentUser.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// ===================================== helper functions =========================================

function generateRandomString() {
  let result           = [];
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
 }
 return result.join('');
}

function getTemplateVars(user, req){
  return { urls: urlDatabase,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] === undefined ? undefined : urlDatabase[req.params.shortURL].longURL,
    user: user
  }
}

function doesEmailExist(email, users){
  for(user in users){
    if(users[user].email === email) return user;
  }
  return false;
}