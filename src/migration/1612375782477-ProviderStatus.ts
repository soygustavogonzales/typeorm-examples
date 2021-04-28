import {MigrationInterface, QueryRunner} from "typeorm";

export class ProviderStatus1612375782477 implements MigrationInterface {
    name = 'ProviderStatus1612375782477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider" ADD "active" boolean NOT NULL DEFAULT true`, undefined);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" ALTER COLUMN "cost" TYPE numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" ALTER COLUMN "imu" TYPE numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "request_report" ALTER COLUMN "subscriptionId" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "sku_jda_mbr" ALTER COLUMN "userId" SET DEFAULT -1`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sku_jda_mbr" ALTER COLUMN "userId" SET DEFAULT '-1'`, undefined);
        await queryRunner.query(`ALTER TABLE "request_report" ALTER COLUMN "subscriptionId" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" ALTER COLUMN "imu" TYPE numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" ALTER COLUMN "cost" TYPE numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "provider" DROP COLUMN "active"`, undefined);
    }

}
