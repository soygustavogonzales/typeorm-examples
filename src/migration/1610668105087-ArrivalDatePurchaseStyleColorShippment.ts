import {MigrationInterface, QueryRunner} from "typeorm";

export class ArrivalDatePurchaseStyleColorShippment1610668105087 implements MigrationInterface {
    name = 'ArrivalDatePurchaseStyleColorShippment1610668105087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_style_color_shipping" ADD IF NOT EXISTS "arrivalDate" TIMESTAMP WITH TIME ZONE`, undefined);
        await queryRunner.query(`ALTER TABLE "request_report" ADD IF NOT EXISTS "subscriptionId" character varying;`);
        await queryRunner.query(`UPDATE "request_report" SET "subscriptionId" = '';`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_style_color_shipping" DROP COLUMN "arrivalDate";`);
        await queryRunner.query(`ALTER TABLE "request_report" DROP COLUMN "subscriptionId";`);
    }

}
