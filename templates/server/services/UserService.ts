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

  // Get the user's password hash
  static async getByQuery(query: FilterQuery<CommonTypes.User>): Promise<DataReply<CommonTypes.User | null>> {
    try {
      const user = await UserModel.findOne(query).exec();
      if (!user) return { data: null };
      return { data: user.toJSON() };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // New method to refresh the token
  static async refresh(user: CommonTypes.User): Promise<DataReply<string>> {
    try {
      const accessToken = AuthService.generateAccessToken(user);
      return { data: accessToken };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}
