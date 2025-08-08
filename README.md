# bruniverse

#### Idea changes:

-   Make a change to include one role related route point that calls to other specific function to handle routes.
-   Send client release to db service classes and remove finally from query method.

## Todo: Main Posting page

-   that should be absolutely postioned
-   User can add tags below their questions
-   center the leftside option buttons
-   Try using context provider for general data that is shared accross components
 Cache static UI compose like category options, etc and serve them via the server.

## Backend

-   Move the backend to express and use the db format I created for edu-platform.
-   instead of store user-data via session storage, it better to keep the sessions token for that.
-   Make good use of middleware just as in the edu-platform.

## Drafts & Formatting
- Think of how to handle formatting

## Posts
- Find a clever way of handling pagination: should I display recent post firsts or last. Should I cache what the a specific user has seen already?