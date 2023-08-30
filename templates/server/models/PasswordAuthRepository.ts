import { EntityTarget, Repository } from 'typeorm';
import { appDataSource } from '../db';
import { PasswordAuthModel } from './PasswordAuthModel';

export class PasswordAuthRepository {
  private entity: EntityTarget<PasswordAuthModel> = PasswordAuthModel;
  private repository: Repository<PasswordAuthModel>;

  constructor() {
    this.repository = appDataSource.getRepository(this.entity);
  }

  async create(userId: string, passwordHash: string): Promise<void> {
    const passwordAuthModel = this.repository.create({ userId, passwordHash });
    await this.repository.save(passwordAuthModel);
  }

  async findByUserId(userId: string): Promise<PasswordAuthModel | undefined> {
    const result = await this.repository.findOne({ where: { userId } });

    if (!result) {
      return undefined;
    }

    return result;
  }
}
