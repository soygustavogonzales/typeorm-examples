import {MigrationInterface, QueryRunner} from "typeorm";

export class PaymentTerms1611603833260 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`INSERT INTO "payment_terms" values (1, 'LC A LA VISTA', '001') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "payment_terms" values (2, 'LC PLAZO PROVEEDOR', '002') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "payment_terms" values (3, 'TRANSFERENCIA BANCARIA', '003') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "payment_terms" values (4, 'COBRANZA BANCARIA', '004') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "payment_terms" values (5, 'OPEN ACCOUNT JPM', '005') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "payment_terms" values (6, 'OPEN ACCOUNT CENCOSUD', '006') ON CONFLICT DO NOTHING;`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DELETE FROM "payment_terms";`);
    }

}
