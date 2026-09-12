import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("cases")
export class Case {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "telegram_chat_id",
    type: "varchar",
    unique: true,
  })
  telegramChatId!: string;

  @Column({
    type: "varchar",
    default: "OPEN",
  })
  status!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
