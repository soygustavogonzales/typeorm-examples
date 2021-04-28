import {MigrationInterface, QueryRunner} from "typeorm";

export class SuggestedVendor1616024090966 implements MigrationInterface {
    name = 'SuggestedVendor1616024090966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_style_negotiation" ADD IF NOT EXISTS "suggestedVendor" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_style_negotiation" DROP COLUMN "suggestedVendor"`, undefined);
    }

}
