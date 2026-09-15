import {MigrationInterface, QueryRunner} from "typeorm";

export class ProductReviews1789456170187 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "product_review" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "rating" integer NOT NULL, "title" character varying(255), "body" text NOT NULL, "customerName" character varying(150) NOT NULL, "verifiedPurchase" boolean NOT NULL DEFAULT false, "status" character varying(20) NOT NULL DEFAULT 'PENDING', "id" SERIAL NOT NULL, "productId" integer, "customerId" integer, CONSTRAINT "PK_6c00bd3bbee662e1f7a97dbce9a" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "product_review_images_asset" ("productReviewId" integer NOT NULL, "assetId" integer NOT NULL, CONSTRAINT "PK_10d72d79dfd9ec0065396224c1b" PRIMARY KEY ("productReviewId", "assetId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_2b0513002d85239654ee211b44" ON "product_review_images_asset" ("productReviewId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_9778b0ed8016853b9947ee93a1" ON "product_review_images_asset" ("assetId") `, undefined);
        await queryRunner.query(`ALTER TABLE "product_review" ADD CONSTRAINT "FK_06e7335708b5e7870f1eaa608d2" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "product_review" ADD CONSTRAINT "FK_73994c5bf5e1fa155b6f5237ea2" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "product_review_images_asset" ADD CONSTRAINT "FK_2b0513002d85239654ee211b440" FOREIGN KEY ("productReviewId") REFERENCES "product_review"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "product_review_images_asset" ADD CONSTRAINT "FK_9778b0ed8016853b9947ee93a1f" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product_review_images_asset" DROP CONSTRAINT "FK_9778b0ed8016853b9947ee93a1f"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_review_images_asset" DROP CONSTRAINT "FK_2b0513002d85239654ee211b440"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_review" DROP CONSTRAINT "FK_73994c5bf5e1fa155b6f5237ea2"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_review" DROP CONSTRAINT "FK_06e7335708b5e7870f1eaa608d2"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_9778b0ed8016853b9947ee93a1"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_2b0513002d85239654ee211b44"`, undefined);
        await queryRunner.query(`DROP TABLE "product_review_images_asset"`, undefined);
        await queryRunner.query(`DROP TABLE "product_review"`, undefined);
   }

}
