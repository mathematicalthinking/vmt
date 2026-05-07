# Update as of May 2026

Many of the docs in this folder were written several years ago, reflecting the structure of VMT when it was first created. Since that time, the basic structure has remained but new developers should confirm that material written in these .md files are, in fact, still reflected in the codebase.

Key changes over the past 5-6 years:

- the system can now run over several servers, with communication coordinate by a redis server.
- synchronization is a less fragile, with the use of a finite state machine (FSM; see utils/controlMachine.js) to keep clients and server in a particular room in a stable state.
- the FSM allows for complex conditions for when to take control away from a person, when to give them more time, etc. These conditions are all defined declaratively in the controlMachine.js. Note that we use xstate and that package's website has a visualization tool for xstate configurations.
- there is definitely an inconsistent mix of strategies connecting the client to the server/database: redux, fetch to custom server scripts, and react-query. For the most part, REST api requests and sockets each have their own flow, but there might be cases where we are better off using one or the other. Generally, it's good separation, however.
- The TabTypes component is intended to simplify the adding of new tab types (new types of rooms). It certainly simplified things when we added Pyret rooms.
- Almost NONE of the test suite actually works. To the extent that anything does work, it was done in Cypress.
- Container vs Component vs Layout is somewhat inconsistently applied. For example, you'll see business logic in a Layout component.
- The .env files are MUCH simplified from earlier. There is basically no clientside .env. Instead, the client gets its environment variables directly from the server. See public/index.js and the line `<script src="/env.js"></script>`. That's a special route to the server.
- Our usage of Webpack is in serious need of upgrade.
- There are likely some polyfills that are still loaded but not needed in modern React.
- The branch fix/amplify contains changes related to the new name for Desmos. However, I am not confident that all necessary files have been changed, so have left this as an unmerged branch.
