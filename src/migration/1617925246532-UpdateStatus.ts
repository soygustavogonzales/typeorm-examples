import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateStatus1617925246532 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`INSERT INTO "status_purchase_color" VALUES (5, 'Cotizado');`);
        queryRunner.query(`UPDATE "status" SET "name" = 'En Negociación' WHERE "id" = 11;`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`DELETE FROM "status_purchase_color" WHERE id = 5;`);
        queryRunner.query(`UPDATE "status" SET "name" = 'Negociado' WHERE "id" = 11;`);
    }
}
