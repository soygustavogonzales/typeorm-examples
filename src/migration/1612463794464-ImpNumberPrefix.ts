import {MigrationInterface, QueryRunner} from "typeorm";

export class ImpNumberPrefix1612463794464 implements MigrationInterface {
    name = 'ImpNumberPrefix1612463794464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_4b58c508597ca982a7b872371f"`, undefined);
        await queryRunner.query(`ALTER TABLE "store" ADD "impnumpfx" character varying`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_92dcc2c624bbc183c6da48caa3" ON "oc_jda" ("piname", "ponumb") `, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_92dcc2c624bbc183c6da48caa3"`, undefined);
        await queryRunner.query(`ALTER TABLE "store" DROP COLUMN "impnumpfx"`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4b58c508597ca982a7b872371f" ON "oc_jda" ("piname", "ponumb") `, undefined);
    }

}
