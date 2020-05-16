import { Model } from 'mongoose';
import { CreateBookDTO } from '../model/dto/createBookDTO';

export class BooksService {
  private books: Model<any>;
  constructor(books: Model<any>) {
    this.books = books;
  }

  /**
   * Create book
   * @param params
   */
  protected async createBook (params: CreateBookDTO): Promise<object> {
    try {
      const result = await this.books.create({
        name: params.name,
        id: params.id,
      });

      return result;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  /**
   * Update a book by id
   * @param id
   * @param data
   */
  protected updateBooks (id: number, data: object) {
    return this.books.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true },
    );
  }

  /**
   * Find books
   */
  protected findBooks () {
    return this.books.find();
  }

  /**
   * Query book by id
   * @param id
   */
  protected findOneBookById (id: number) {
    return this.books.findOne({ id });
  }

  /**
   * Delete book by id
   * @param id
   */
  protected deleteOneBookById (id: number) {
    return this.books.deleteOne({ id });
  }
}
