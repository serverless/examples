
export const findOne = {
  "_id": "5dff58da85eb210f0aac43af",
  "name": "深入浅出Node.js",
  "id": 25768396,
  "createdAt": "2019-12-22T11:51:54.857Z",
  "__v": 0
};

export const castError = new Error('Cast to number failed for value "NaN" at path "id" for model "Books"');

export const find = [
  {
    "_id": "5dff58da85eb210f0aac43af",
    "name": "深入浅出Node.js",
    "id": 25768396,
    "createdAt": "2019-12-22T11:51:54.857Z",
    "__v": 0
  },
  {
    "_id": "5e0188f53877986a548aa6f4",
    "name": "你不知道的JavaScript（上卷）",
    "id": 26351021,
    "createdAt": "2019-12-24T03:41:41.791Z",
    "__v": 0
  }
];

export const findError = new Error('test find error');

export const create = {
  "_id": "5eb0023e6460b01a9461c8fc",
  "name": "Node.js：来一打 C++ 扩展",
  "id": 30247892,
  "createdAt": "2020-05-04T11:53:34.056Z",
  "__v": 0
}

export const createError = new Error('E11000 duplicate key error collection: study1.books index: id_1 dup key: { id: 30247892 }');

export const update = {
  "_id": "5eb0023e6460b01a9461c8fc",
  "name": "Node.js：来一打 C++ 扩展",
  "id": 30247892,
  "createdAt": "2020-05-04T11:53:34.056Z",
  "__v": 0,
  "description": "阅读《Node.js：来一打 C++ 扩展》，相当于同时学习Chrome V8 开发、libuv 开发以及 Node.js 的原生 C++ 扩展开发知识，非常值得！"
}

export const deleteOne = {
  "n": 1,
  "opTime": {
    "ts": "6822972891668152321",
    "t": 29
  },
  "electionId": "7fffffff000000000000001d",
  "ok": 1,
  "$clusterTime": {
    "clusterTime": "6822972891668152321",
    "signature": {
        "hash": "ZEDvpLVNn/eA6weZEWboNr0H7o8=",
        "keyId": "6772591495061962755"
    }
  },
  "operationTime": "6822972891668152321",
  "deletedCount": 1
}

export const deletedCount = {
  "n":0,
  "opTime":{
    "ts":"6822975382749184001",
    "t":29
  },
  "electionId":"7fffffff000000000000001d",
  "ok":1,
  "$clusterTime":{
    "clusterTime":"6822975382749184001",
    "signature":{
        "hash":"6s7HFnoM7FGe1esPR/qwh+Et9+0=",
        "keyId":"6772591495061962755"
    }
  },
  "operationTime":"6822975382749184001",
  "deletedCount":0
}