import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNotificationDataUpdateRequestReport1611754496055 implements MigrationInterface {
    name = 'AddNotificationDataUpdateRequestReport1611754496055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_report" ADD IF NOT EXISTS "notificationData" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_report" DROP COLUMN "notificationData"`, undefined);
    }

}
