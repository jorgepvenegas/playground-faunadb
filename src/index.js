const app = require("express")();
const faunadb = require("faunadb");

const KEY = "YOUR_FAUNA_KEY";

const client = new faunadb.Client({
  secret: KEY,
});

const {
  Paginate,
  Get,
  Select,
  Match,
  Index,
  Create,
  Collection,
  Lambda,
  Ref,
  Var,
  Join,
  Call,
  Function: Fn,
} = faunadb.query;

app.get("/tweet/:id", async (req, res) => {
  console.log(req.params?.id);

  const doc = await client
    .query(Get(Ref(Collection("tweets"), req.params.id)))
    .catch((e) => res.send(e));

  res.send(doc);
});

app.post("/tweet", async (req, res) => {
  const data = {
    user: Call(Fn("getUser"), "Caroline"),
    text: "Tweet from Caroline",
  };

  const doc = await client.query(Create(Collection("tweets"), { data }));

  res.send(doc);
});

app.get("/tweet", async (req, res) => {
  const docs = await client.query(
    Paginate(Match(Index("tweets_by_user"), Call(Fn("getUser"), "Jorge")))
  );

  res.send(docs);
});

app.post("/relationship", async (req, res) => {
  const data = {
    follower: Call(Fn("getUser"), "Jorge"),
    followee: Call(Fn("getUser"), "Caroline"),
  };

  const doc = await client.query(Create(Collection("relationships"), { data }));

  res.send(doc);
});

app.get("/feed", async (req, res) => {
  const docs = await client.query(
    Paginate(
      Join(
        Match(Index("followers_by_followee"), Call(Fn("getUser"), "Caroline")),
        Index("tweets_by_user")
      )
    )
  );

  res.send(docs);
});

app.listen(5001, () => {
  console.log("API on http://localhost:5001");
});
