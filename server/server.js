const express = require("express");
const path = require("path");
const db = require("./config/connection");
// import ApolloServer
const { ApolloServer } = require("apollo-server-express");
// authentication middleware for JWT's
const { authMiddleware } = require("./utils/auth");
// import our typeDefs and resolvers
const { typeDefs, resolvers } = require("./schema");
const app = express();
const PORT = process.env.PORT || 3001;
// create a new Apollo server and pass in our schema data and authentication middleware
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});
// Create a new instance of an Apollo server with the GraphQL schema
async function startApolloServer() {
  await server.start();
  // integrate our Apollo server with the Express application as middleware
  server.applyMiddleware({ app });
}
// Call the async function to start the server
startApolloServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`🧠 API server running on port ${PORT}! 🧠`);
    // log where we can go to test our GQL API
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});






// const express = require('express');
// const { ApolloServer } = require('apollo-server-express');
// const path = require('path');
// const db = require('./config/connection');
// const routes = require('./routes');
// const { authMiddleware } = require('./utils/auth');
// const { resolvers, typeDefs } = require('./schema')

// const app = express();
// const PORT = process.env.PORT || 3001;

// const server = new ApolloServer({
//   typeDefs, resolvers, context: authMiddleware
// });

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // if we're in production, serve client/build as static assets
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));
// }

// app.use(routes);

// const startServer = async (typeDefs, resolvers) => {
//   await server.start()
//   server.applyMiddleware({ app })
//   db.once('open', () => {
//     app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT} GraphQL at http://localhost:${PORT}${server.graphqlPath}`));
//   })
// };

// startServer(typeDefs, resolvers);