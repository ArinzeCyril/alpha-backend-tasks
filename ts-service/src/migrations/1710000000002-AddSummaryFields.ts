import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSummaryFields1710000000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('candidate_summaries', [
            new TableColumn({
                name: 'prompt_version',
                type: 'varchar',
                length: '50',
                isNullable: true,
            }),
            new TableColumn({
                name: 'error_message',
                type: 'text',
                isNullable: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('candidate_summaries', 'error_message');
        await queryRunner.dropColumn('candidate_summaries', 'prompt_version');
    }
}
