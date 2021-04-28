import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSeasonProduct1617205227496 implements MigrationInterface {
    name = 'AddSeasonProduct1617205227496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "seasonProducts" integer array`, undefined);
        await queryRunner.query(`update "purchase" p set "seasonProducts" = ARRAY[p."seasonCommercialId", 3]`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "seasonProducts"`, undefined);
    }

}
