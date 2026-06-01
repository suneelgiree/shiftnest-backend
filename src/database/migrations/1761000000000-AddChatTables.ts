import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddChatTables1761000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'conversations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'participantsKey', type: 'varchar', isUnique: true },
          { name: 'tenantId', type: 'uuid' },
          { name: 'ownerId', type: 'uuid' },
          { name: 'lastMessage', type: 'text', isNullable: true },
          { name: 'lastMessageAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'conversationId', type: 'uuid' },
          { name: 'senderId', type: 'uuid' },
          { name: 'text', type: 'text' },
          { name: 'isRead', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('conversations', new TableForeignKey({
      columnNames: ['tenantId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('conversations', new TableForeignKey({
      columnNames: ['ownerId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('messages', new TableForeignKey({
      columnNames: ['conversationId'], referencedTableName: 'conversations', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('messages', new TableForeignKey({
      columnNames: ['senderId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('messages', true);
    await queryRunner.dropTable('conversations', true);
  }
}