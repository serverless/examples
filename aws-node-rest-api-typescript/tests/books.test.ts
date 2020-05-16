import lambdaTester from 'lambda-tester';
import { expect } from 'chai';
import { findOne, find, create, update, deleteOne } from '../app/handler';
import * as booksMock from './books.mock';
import { books as BooksModel } from '../app/model/books';
import sinon from 'sinon';

describe('FindOne [GET]', () => {
  it('success', () => {
    try {
      const s = sinon
        .mock(BooksModel);

      s.expects('findOne')
        .atLeast(1)
        .atMost(3)
        .resolves(booksMock.findOne);

      return lambdaTester(findOne)
      .event({ pathParameters: { id: 25768396 } })
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
        const body = JSON.parse(result.body);
        expect(body.code).to.equal(0);
        s.verify();
        s.restore();
      });
    } catch (err) {
      console.log(err);
    }
  });

  it('error', () => {
    try {
      const s = sinon
        .mock(BooksModel);

      s.expects('findOne')
        .rejects(booksMock.castError);

      return lambdaTester(findOne)
      .event({ pathParameters: { id: 25768396 } })
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
        const body = JSON.parse(result.body);
        expect(body.code).to.equal(1000);
        s.restore();
      });
    } catch (err) {
      console.log(err);
    }
  });
});

describe('Find [GET]', () => {
  it('success', () => {
    const s = sinon
      .mock(BooksModel);

    s.expects('find')
      .resolves(booksMock.find);

    return lambdaTester(find)
    .event({})
    .expectResult((result: any) => {
      expect(result.statusCode).to.equal(200);
      const body = JSON.parse(result.body);
      expect(body.code).to.equal(0);
      s.restore();
    });
  });

  it('error', () => {
    const s = sinon
      .mock(BooksModel);

    s.expects('find').rejects(booksMock.findError);

    return lambdaTester(find)
    .event({})
    .expectResult((result: any) => {
      expect(result.statusCode).to.equal(200);
      const body = JSON.parse(result.body);
      expect(body.code).to.equal(1000);
      s.restore();
    });
  });
});

describe('Create [POST]', () => {
  it('success', () => {
    const s = sinon
      .mock(BooksModel);

    s.expects('create').resolves(booksMock.create);

    return lambdaTester(create)
      .event({ body: JSON.stringify({
        name: 'Node.js：来一打 C++ 扩展',
        id: 30247892,
      })})
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
        const body = JSON.parse(result.body);
        expect(body.code).to.equal(0);
        s.restore();
      });
  });

  it('error', () => {
    const s = sinon
      .mock(BooksModel);

    s.expects('create').rejects(booksMock.createError);

    return lambdaTester(create)
      .event({ body: JSON.stringify({
        name: 'Node.js：来一打 C++ 扩展',
        id: 30247892,
      })})
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
        const body = JSON.parse(result.body);
        expect(body.code).to.equal(1000);
        s.restore();
      });
  });
});

describe('Update [PUT]', () => {
  it('success', () => {
    const s = sinon
      .mock(BooksModel);

    s.expects('findOneAndUpdate').resolves(booksMock.update);

    return lambdaTester(update)
      .event({ pathParameters: { id: 30247892 }, body: JSON.stringify({
        name: 'Node.js：来一打 C++ 扩展',
        description: '阅读《Node.js：来一打 C++ 扩展》，相当于同时学习Chrome V8 开发、libuv 开发以及 Node.js 的原生 C++ 扩展开发知识，非常值得！',
      })})
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
        const body = JSON.parse(result.body);
        expect(body.code).to.equal(0);
        s.restore();
      });
  });

  it('error', () => {
    const s = sinon
      .mock(BooksModel);

    s.expects('findOneAndUpdate').rejects(booksMock.castError);

    return lambdaTester(update)
      .event({  pathParameters: { id: '30247892_' }, body: JSON.stringify({
        name: 'Node.js：来一打 C++ 扩展',
        description: '阅读《Node.js：来一打 C++ 扩展》，相当于同时学习Chrome V8 开发、libuv 开发以及 Node.js 的原生 C++ 扩展开发知识，非常值得！',
      })})
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
        const body = JSON.parse(result.body);
        expect(body.code).to.equal(1000);
        s.restore();
      });
  });
});

describe('DeleteOne [Delete]', () => {
  it('success', () => {
    const s = sinon
      .mock(BooksModel);

    s.expects('deleteOne').resolves(booksMock.deleteOne);

    return lambdaTester(deleteOne)
      .event({  pathParameters: { id: 30247892 } })
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
        const body = JSON.parse(result.body);
        expect(body.code).to.equal(0);
        s.restore();
      });
  });

  it('deletedCount === 0', () => {
    const s = sinon
      .mock(BooksModel);

    s.expects('deleteOne').resolves(booksMock.deletedCount);

    return lambdaTester(deleteOne)
      .event({ pathParameters: { id: 30247892 } })
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
        const body = JSON.parse(result.body);
        expect(body.code).to.equal(1010);
        s.restore();
      });
  });

  it('error', () => {
    const s = sinon
      .mock(BooksModel);

    s.expects('deleteOne').rejects(booksMock.castError);

    return lambdaTester(deleteOne)
      .event({ pathParameters: { id: '30247892_' } })
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
        const body = JSON.parse(result.body);
        expect(body.code).to.equal(1000);
        s.restore();
      });
  });
});
