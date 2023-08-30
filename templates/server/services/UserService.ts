import { UserRepository } from '../models/UserRepository';
import { DataReply } from '../core/DataReply';
import { AuthService } from './AuthService';
import { PasswordAuthRepository } from '../models/PasswordAuthRepository';
import { CommonTypes } from 'common';

export class UserService {
  static async create(user: Partial<CommonTypes.User>, password?: string): Promise<DataReply<CommonTypes.User>> {
    try {
      const userRepo = new UserRepository();
      const existing = await userRepo.findByEmail(user.email!);

      if (existing) {
        return { error: 'That email is already in use' };
      }

      const createdModel = await userRepo.create(user);
      const created = createdModel.toClient();

      if (password) {
        const hashedPassword = await AuthService.hashPassword(password);
        const passwordAuthRepo = new PasswordAuthRepository();
        await passwordAuthRepo.create(created.id, hashedPassword);
      }

      return { data: created };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  static async get(id: string): Promise<DataReply<CommonTypes.User | null>> {
    try {
      const userRepo = new UserRepository();
      const userModel = await userRepo.findById(id);

      if (!userModel) {
        return { data: null };
      }

      return { data: userModel.toClient() };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  static async getByQuery(query: Partial<CommonTypes.User>): Promise<DataReply<CommonTypes.User | null>> {
    try {
      const userRepo = new UserRepository();
      const userModel = await userRepo.findByQuery(query);

      if (!userModel) {
        return { data: null };
      }

      return { data: userModel.toClient() };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}
