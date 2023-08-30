import { UserModel } from '../models/UserModel';
import { CommonTypes } from 'common';
import { DataReply } from '../core/DataReply';
import { AuthService } from './AuthService';
import { FilterQuery } from 'mongoose';
import { PasswordAuthModel } from '../models/PasswordAuthModel';

export class UserService {
  // Create a new user
  static async create(user: Partial<CommonTypes.User>, password?: string): Promise<DataReply<CommonTypes.User>> {
    try {
      // Check if the user already exists
      const existing = await UserModel.findOne({ email: user.email }).exec();
      if (existing) {
        return { error: 'That email is already in use' };
      }

      const created = await UserModel.create(user);

      if (password) {
        // Create a password auth record
        const hashedPassword = await AuthService.hashPassword(password);
        await PasswordAuthModel.create({
          userId: created.id,
          passwordHash: hashedPassword,
        });
      }

      return { data: created.toJSON() };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Get a user by ID
  static async get(id: string): Promise<DataReply<CommonTypes.User | null>> {
    try {
      const user = await UserModel.findById(id).exec();
      if (!user) return { data: null };
      return { data: user.toJSON() };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Get user by loose query
  static async getByQuery(query: FilterQuery<CommonTypes.User>): Promise<DataReply<CommonTypes.User | null>> {
    try {
      const user = await UserModel.findOne(query).exec();
      if (!user) return { data: null };
      return { data: user.toJSON() };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}
