// index.js
'use strict';

const { app } = require('./handler');

app.listen(3000, () => {
    console.info(`Listening on port 3000.`);
});
