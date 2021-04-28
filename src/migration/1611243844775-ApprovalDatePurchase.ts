import {MigrationInterface, QueryRunner} from "typeorm";

export class ApprovalDatePurchase1611243844775 implements MigrationInterface {
    name = 'ApprovalDatePurchase1611243844775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD IF NOT EXISTS "approvalDate" TIMESTAMP WITH TIME ZONE`, undefined);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" ALTER COLUMN "cost" TYPE numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" ALTER COLUMN "imu" TYPE numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "sku_jda_mbr" ALTER COLUMN "userId" SET DEFAULT -1`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sku_jda_mbr" ALTER COLUMN "userId" SET DEFAULT '-1'`, undefined);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" ALTER COLUMN "imu" TYPE numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" ALTER COLUMN "cost" TYPE numeric`, undefined);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "approvalDate"`, undefined);
    }

}
