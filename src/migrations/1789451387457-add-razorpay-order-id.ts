import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRazorpayOrderId1789451387457 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order" ADD "customFieldsRazorpayorderid" character varying(255)`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "customFieldsRazorpayorderid"`, undefined);
   }

}
