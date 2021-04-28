import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeStatusPurchase1612363145749 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`INSERT INTO "status" VALUES (12, 'Detalles Productos');`);
        queryRunner.query(`INSERT INTO "status" VALUES (13, 'Detalles Comerciales');`);
        queryRunner.query(`UPDATE "purchase" SET "statusId" = 12 WHERE "statusId" = 5;`);
        queryRunner.query(`UPDATE "purchase" SET "statusId" = 13 WHERE "statusId" = 4;`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`UPDATE "purchase" SET "statusId" = 5 WHERE "statusId" = 12;`);
        queryRunner.query(`UPDATE "purchase" SET "statusId" = 4 WHERE "statusId" = 13;`);
        queryRunner.query(`DELETE FROM "status" WHERE id = 12;`);
        queryRunner.query(`DELETE FROM "status" WHERE id = 13;`);
    }

}
