import {MigrationInterface, QueryRunner} from "typeorm";

export class OcJda1612381407595 implements MigrationInterface {
    name = 'OcJda1612381407595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "oc_jda_det" ("id" SERIAL NOT NULL, "ponumb" integer NOT NULL, "inumbr" numeric(9,0) NOT NULL, "pomcst" numeric(12,3) NOT NULL, "pomvat" numeric(10,0) NOT NULL, "pomret" numeric(10,0) NOT NULL, "pomqty" numeric(7,0) NOT NULL, "poscol" integer NOT NULL, "possiz" character varying NOT NULL, "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT LOCALTIMESTAMP, "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT LOCALTIMESTAMP, "deleteDate" TIMESTAMP WITH TIME ZONE, "ocjdaId" integer NOT NULL, CONSTRAINT "PK_62ef39c9bf068ac424605bbc708" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_21b38fd66a7689601d125e1e7f" ON "oc_jda_det" ("ponumb", "inumbr") `, undefined);
        await queryRunner.query(`CREATE TABLE "oc_jda" ("id" SERIAL NOT NULL, "piname" character varying NOT NULL, "ponot1" character varying NOT NULL, "ponumb" integer NOT NULL, "povnum" integer NOT NULL, "podest" character varying NOT NULL, "postor" integer NOT NULL, "podpt" integer NOT NULL, "poedat" integer NOT NULL, "createDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT LOCALTIMESTAMP, "updateDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT LOCALTIMESTAMP, "deleteDate" TIMESTAMP WITH TIME ZONE, "providerId" integer NOT NULL, CONSTRAINT "PK_1068f45910a2687e992c117a371" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4b58c508597ca982a7b872371f" ON "oc_jda" ("piname", "ponumb") `, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda_det" ADD CONSTRAINT "FK_94fad60883713eb6524d64f2c6f" FOREIGN KEY ("ocjdaId") REFERENCES "oc_jda"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda" ADD CONSTRAINT "FK_def555c800fc2e65d9366007d3c" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oc_jda" DROP CONSTRAINT "FK_def555c800fc2e65d9366007d3c"`, undefined);
        await queryRunner.query(`ALTER TABLE "oc_jda_det" DROP CONSTRAINT "FK_94fad60883713eb6524d64f2c6f"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_4b58c508597ca982a7b872371f"`, undefined);
        await queryRunner.query(`DROP TABLE "oc_jda"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_21b38fd66a7689601d125e1e7f"`, undefined);
        await queryRunner.query(`DROP TABLE "oc_jda_det"`, undefined);
    }

}
