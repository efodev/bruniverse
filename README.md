
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
-   Remove the user-data header and use the session token.
- Redirect User to post endpoint if session is active.

## Drafts & Formatting

-   Think of how to handle formatting

## Posts

-   Find a clever way of handling pagination: should I display recent post firsts or last. Should I cache what the a specific user has seen already?

# Drafts

-   Finish working on saving and loading drafts and post by eow
-   Work on the post modal for when no draft is present. Probably need to work with the save and post button layout and the draft side.
-   Add scrolling to the draft side bar.
-   Pagination -- huge thing to look into. Prolly gonna be hard?

## Frontend

-   Wierd Display if category is not loaded. Look into that. I'm thinking it's will have to do with min width.
- Find a way to keep the user info at session storage active
- Remember previous api query for each api service function in order to add fetch batches with pagination. (v2). Move more to using redux patterns..

*   I am also thinking to rebuild the entire frontend using size relative to the viewport width first, while setting the window with to 100% and other stuff relative. Also fonts will be rem units. -- Basically follow Melody's design to the Tee.
 