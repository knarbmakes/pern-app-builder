import mongoose from 'mongoose';
import { schemaTemplate } from '../core/schemaTemplate';
import { PasswordAuth } from '../types/PasswordAuth';

const PasswordAuthSchema = schemaTemplate<PasswordAuth>({
  userId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

export const PasswordAuthModel = mongoose.model('PasswordAuth', PasswordAuthSchema);
