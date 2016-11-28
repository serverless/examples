'use strict';

const pngImageContent = `8950 4e47 0d0a 1a0a 0000 000d 4948 4452
0000 000a 0000 000a 0806 0000 008d 32cf
bd00 0000 1849 4441 5418 9563 3431 ccfd
cf40 0460 2246 d1a8 42ea 2904 00f4 9d01
e5cb 80a9 bf00 0000 0049 454e 44ae 4260
82`;

module.exports.image = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png',
    },
    body: pngImageContent,
  };

  // callback is sending HTML back
  callback(null, response);
};
