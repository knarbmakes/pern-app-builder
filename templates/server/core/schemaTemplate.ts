import { Schema, Document } from 'mongoose';

export function schemaTemplate<T>(definition: any): Schema {
  const schema = new Schema<T & Document>(definition, { timestamps: true });

  // Turn _id into id and remove _id and __v from the returned object
  schema.virtual('id').get(function (this: Document) {
    return this._id.toHexString();
  });

  schema.set('toJSON', {
    virtuals: true,
    transform: function (_doc, ret, _options) {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });

  return schema;
}
