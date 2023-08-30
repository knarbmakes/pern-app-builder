import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { PasswordAuth } from "../types/PasswordAuth";

@Entity()
export class PasswordAuthModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  userId: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toClient(): PasswordAuth {
    return {
      id: this.id,
      userId: this.userId,
      passwordHash: this.passwordHash
    };
  }
}
