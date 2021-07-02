import {MigrationInterface, QueryRunner} from "typeorm";

export class OcRelease1625076215684 implements MigrationInterface {
    name = 'OcRelease1625076215684'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "oc_jda_mbr" ("id" SERIAL NOT NULL, "jdaMember" character varying NOT NULL, "userId" integer NOT NULL DEFAULT -1, "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT LOCALTIMESTAMP, "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT LOCALTIMESTAMP, "deleteDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e73b81b66ccad2de7722874ce81" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9145edfa004192d47d15475abc" ON "oc_jda_mbr" ("jdaMember") `, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ADD "pocost" real`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ADD "potpid" character varying NOT NULL DEFAULT 'I'`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ADD "ocJdaMbrId" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" DROP CONSTRAINT "FK_def555c800fc2e65d9366007d3c"`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ALTER COLUMN "piname" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ALTER COLUMN "providerId" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ADD CONSTRAINT "FK_def555c800fc2e65d9366007d3c" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ADD CONSTRAINT "FK_c05bc0f3f8c9396fc0ff53ab628" FOREIGN KEY ("ocJdaMbrId") REFERENCES "oc_jda_mbr"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oc_jda" DROP CONSTRAINT "FK_c05bc0f3f8c9396fc0ff53ab628"`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" DROP CONSTRAINT "FK_def555c800fc2e65d9366007d3c"`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ALTER COLUMN "providerId" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ALTER COLUMN "piname" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ADD CONSTRAINT "FK_def555c800fc2e65d9366007d3c" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" DROP COLUMN "ocJdaMbrId"`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" DROP COLUMN "potpid"`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" DROP COLUMN "pocost"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_9145edfa004192d47d15475abc"`, undefined);
        await queryRunner.query(`DROP TABLE "oc_jda_mbr"`, undefined);
    }

}
