const http = require('http');

const url = 'http://localhost:3000/hello';
const nbRequests = 1000;

const bench = async () => {
    console.info(nbRequests + ' "GET" requests to "' + url + '"');
    console.time('Total');
    const results = [];
    for (let i = 1; i <= nbRequests; i++) {
        await new Promise((resolve, reject) => {
            var begin = Date.now();
            http.get(url, (resp) => {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Calculate the time spent
                resp.on('end', () => {
                    results.push(Date.now() - begin);
                    resolve();
                });

            }).on('error', (error) => {
                reject(error);
            });
        });
    }
    console.timeEnd('Total');
    console.info('Average: ', results.reduce((p, c) => {
        return p + c;
    }) / results.length + 'ms');
};

bench();