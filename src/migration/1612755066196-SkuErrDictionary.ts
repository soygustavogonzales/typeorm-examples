import {MigrationInterface, QueryRunner} from "typeorm";

export class SkuErrDictionary1612755066196 implements MigrationInterface {
    name = 'SkuErrDictionary1612755066196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sku_err_dictionary" ("id" SERIAL NOT NULL, "field" character varying NOT NULL, "fieldref" character varying NOT NULL, "desc" character varying NOT NULL, "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT LOCALTIMESTAMP, "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT LOCALTIMESTAMP, "deleteDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_1d24ff1416b507b97c903236d33" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6b57da2ce263a367458b7dd2eb" ON "sku_err_dictionary" ("field") `, undefined);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM002', 'XCMPRV', 'Proveedor inválido') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM003', 'XCMDPT', 'Departamento inválido') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM004', 'XCMSDT', 'Sub-Departamento inválido') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM005', 'XCMCLA', 'Clase inválida') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM007', 'XCMCOS', 'Costo inválido') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM008', 'XCMPRC', 'Precio inválido') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM016', 'XCMMAR', 'Marca inválida') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM017', 'XCMTEM', 'Temporada inválida') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM018', 'XCMPRF', 'Perfil inválido') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM019', 'XCMPAI', 'Pais inválido') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM025', 'XCMATC', 'ATC inválido') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "sku_err_dictionary" ("field", "fieldref", "desc") values ('XCM020', 'XCMTAM', 'Tamaño de articulo inválido') ON CONFLICT DO NOTHING;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_6b57da2ce263a367458b7dd2eb"`, undefined);
        await queryRunner.query(`DROP TABLE "sku_err_dictionary"`, undefined);
    }

}
