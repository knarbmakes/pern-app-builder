import mongoose from 'mongoose';
import { schemaTemplate } from '../core/schemaTemplate';
import { CommonTypes } from 'common';

const UserSchema = schemaTemplate<CommonTypes.User>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
});

export const UserModel = mongoose.model('User', UserSchema);
