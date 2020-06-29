"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const schema_1 = require("./schema");
const { createStore } = require('./utils');
const resolvers = require('./resolvers');
const isEmail = require('isemail');
const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');
const store = createStore();
const server = new apollo_server_1.ApolloServer({
    typeDefs: schema_1.typeDefs,
    resolvers,
    engine: true,
    dataSources: () => ({
        launchAPI: new LaunchAPI(),
        userAPI: new UserAPI({ store })
    }),
    // this context function is called every time a GQL operation is called
    // the return of the function is the "context" arg passed in every resolver
    // You can check authentication in this function
    context: async ({ req }) => {
        // simple auth check on every request
        const auth = req.headers && req.headers.authorization || '';
        const email = Buffer.from(auth, 'base64').toString('ascii');
        if (!isEmail.validate(email))
            return { user: null };
        // find a user by their email
        const users = await store.users.findOrCreate({ where: { email } });
        const user = users && users[0] || null;
        return { user: { ...user.dataValues } };
    },
});
server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
