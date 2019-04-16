"use strict";

module.exports.getUsers = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify([
      {
        id: "09d21d59-c138-4f70-ae82-3552148d3d43",
        name: "Jimbo"
      },
      {
        id: "2f8fb730-5d09-4493-aea5-46b3e3f8b08a",
        name: "Dumbo"
      },
      {
        id: "03d2690f-6d01-4cf1-b947-a8cc0133cc9f",
        name: "Rambo"
      }
    ])
  };
};
