import { join } from 'path';
import { app } from 'electron';
import Datastore from 'nedb-promises';
import Ajv, { ValidateFunction } from 'ajv';
import bookSchema, { Book } from '../schemas/bookSchema';

class Library {
  validator: ValidateFunction<Book>;

  db: Datastore;

  constructor() {
    const ajv = new Ajv({
      allErrors: true,
      useDefaults: true,
    });

    this.validator = ajv.compile(bookSchema);
    this.db = Datastore.create({
      filename: join(app.getPath('userData'), 'library.db'),
      autoload: true,
      timestampData: true,
    });
  }

  validate(data: Book) {
    return this.validator(data);
  }

  async get(_id: number): Promise<Book> {
    return this.db.findOne({ _id }).exec();
  }

  async getAll(query: any = {}): Promise<Book[]> {
    return this.db.find(query).limit(10);
  }

  async create(data: Book) {
    if (this.validate(data)) return this.db.insert(data);
    return {
      error: 'data is not valid',
    };
  }

  async remove(query: any = {}, options = { multi: true }) {
    return this.db.remove(query, options);
  }
}

export default new Library();
