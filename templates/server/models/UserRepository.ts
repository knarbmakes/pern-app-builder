import { CommonTypes } from 'common';
import { EntityTarget, Repository } from 'typeorm';
import { appDataSource } from '../db';
import { UserModel } from './UserModel';

export class UserRepository {
  private entity: EntityTarget<UserModel> = UserModel;
  private repository: Repository<UserModel>;

  constructor() {
    this.repository = appDataSource.getRepository(this.entity);
  }

  async findByEmail(email: string): Promise<UserModel | undefined> {
    const result = await this.repository.findOne({ where: { email } });
    if (!result) {
      return undefined;
    }

    return result;
  }

  async create(user: Partial<CommonTypes.User>): Promise<UserModel> {
    const userModel = this.repository.create(user);
    return await this.repository.save(userModel);
  }

  async findById(id: string): Promise<UserModel | undefined> {
    const result = await this.repository.findOne({ where: { id } });
    if (!result) {
      return undefined;
    }

    return result;
  }

  async findByQuery(query: Partial<CommonTypes.User>): Promise<UserModel | undefined> {
    const result = await this.repository.findOne({ where: query as any });
    if (!result) {
      return undefined;
    }

    return result;
  }
}
