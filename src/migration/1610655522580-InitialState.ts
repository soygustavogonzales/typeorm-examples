import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialState1610655522580 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "category" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "active" bool NOT NULL DEFAULT true
          );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "cotization" (
            "id" serial NOT NULL PRIMARY KEY,
            "styleId" integer NOT NULL,
            "fob" numeric(10,3),
            "comments" varchar,
            "selected" bool NOT NULL DEFAULT false,
            "purchaseStyleId" integer,
            "providerId" integer,
            "exitPortId" integer
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "cso" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "active" bool NOT NULL DEFAULT true
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "designer" (
            "id" serial NOT NULL PRIMARY KEY,
            "firstName" varchar NOT NULL,
            "lastName" varchar NOT NULL
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "destiny_country" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "shortName" varchar NOT NULL,
            "iva" integer
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "dollar_change" (
            "id" serial NOT NULL PRIMARY KEY,
            "value" numeric NOT NULL,
            "active" bool NOT NULL,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6),
            "destinyCountryId" integer,
            "seasonCommercialId" integer
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "ecom_units_config" (
            "id" serial NOT NULL PRIMARY KEY,
            "profileId" integer NOT NULL,
            "brandId" integer NOT NULL,
            "classTypeId" integer NOT NULL,
            "percentage" integer NOT NULL DEFAULT 10,
            "seasonCommercialId" integer
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "ecommerce_unit_config" (
            "id" serial NOT NULL PRIMARY KEY,
            "profileId" integer NOT NULL,
            "brandId" integer NOT NULL,
            "classTypeId" integer NOT NULL,
            "seasonCommercialId" int4
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "exit_port" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "country" varchar,
            "jdaCode" varchar NOT NULL,
            "active" bool NOT NULL DEFAULT true
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "import_factor" (
            "id" serial NOT NULL PRIMARY KEY,
            "departmentId" integer NOT NULL,
            "originCountryId" integer,
            "active" bool NOT NULL,
            "shipmethodId" integer,
            "factor" numeric(3,2) NOT NULL,
            "destinyCountryId" integer
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "origin_country" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "shortName" varchar NOT NULL,
            "transitDays" integer NOT NULL DEFAULT 0
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "packaging" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "active" bool NOT NULL DEFAULT true,
            "jdaCode" varchar
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "packing_method" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "active" bool NOT NULL DEFAULT true
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "payment_terms" (
            "id" int4 NOT NULL,
            "name" varchar NOT NULL,
            "jdaCode" varchar
          );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "payment_time" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "jdaCode" varchar
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "profile" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "jdaCode" varchar,
            "active" bool DEFAULT true
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "provider" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "type" varchar,
            "code" varchar NOT NULL,
            "codeJda" varchar NOT NULL,
            "paymentTerm1" varchar NOT NULL,
            "paymentTerm2" varchar,
            "address" varchar NOT NULL,
            "email" varchar,
            "originCountryId" integer
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "purchase" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "brands" int4[] NOT NULL,
            "departments" int4[] NOT NULL,
            "userId" int4 NOT NULL,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6),
            "seasonCommercialId" int4,
            "statusId" int4,
            "tripDate" timestamp(6) NOT NULL
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "purchase_store" (
            "id" serial NOT NULL PRIMARY KEY,
            "purchaseId" int4,
            "storeId" int4,
            "active" bool NOT NULL DEFAULT true,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6)
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "purchase_style" (
            "id" serial NOT NULL PRIMARY KEY,
            "styleId" int4 NOT NULL,
            "purchaseStoreId" int4,
            "active" bool NOT NULL DEFAULT true,
            "statusId" int4,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6)
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "purchase_style_color" (
            "id" serial NOT NULL PRIMARY KEY,
            "styleColorId" integer NOT NULL,
            "purchaseStyleId" integer,
            "state" bool NOT NULL,
            "approved" bool NOT NULL DEFAULT false,
            "piName" varchar,
            "statusId" integer NOT NULL,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6)
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "purchase_style_color_shipping" (
            "id" serial NOT NULL PRIMARY KEY,
            "units" int4 NOT NULL,
            "shipping" varchar NOT NULL,
            "date" timestamptz(6) NOT NULL,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6),
            "purchaseStyleColorId" int4,
            "piName" varchar
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "purchase_style_cotization" (
            "id" int4 NOT NULL,
            "fob" numeric(10,3),
            "comments" varchar,
            "selected" bool NOT NULL DEFAULT false,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6),
            "purchaseStyleId" int4,
            "providerId" int4,
            "exitPortId" int4
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "purchase_style_details" (
            "id" serial NOT NULL PRIMARY KEY,
            "atc" bool DEFAULT false,
            "hanger" bool DEFAULT false,
            "vstTag" bool DEFAULT false,
            "merchandiser" varchar,
            "techFile" bool DEFAULT false,
            "sizeSpec" bool DEFAULT false,
            "internetDescription" varchar,
            "collection" varchar,
            "event" varchar,
            "additionalAccesory" varchar,
            "composition" varchar,
            "referencialProvider" varchar,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6),
            "seasonStickerId" int4,
            "sizeId" int4,
            "ratioId" int4,
            "shippingMethodId" int4,
            "rseId" int4,
            "segmentId" int4,
            "providerId" int4,
            "originId" int4,
            "packingMethodId" int4,
            "categoryId" int4,
            "csoId" int4,
            "fob" numeric(10,3),
            "price" numeric(10),
            "target" numeric(10,3),
            "sato" numeric(10),
            "designer" varchar,
            "negotiatior" varchar,
            "gauge" varchar,
            "fabricWight" varchar,
            "fabricConstruction" varchar,
            "fabricWeaving" varchar,
            "fobReferencial" numeric(10,3),
            "purchaseStyleId" int4,
            "dollarChange" numeric,
            "importFactor" numeric(3,2),
            "cost" numeric,
            "imu" numeric,
            "exitPortId" int4,
            "productManager" varchar,
            "brandManager" varchar,
            "purchaseStyleNegotiationId" int4
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "purchase_style_negotiation" (
            "id" serial NOT NULL PRIMARY KEY,
            "styleId" int4,
            "fob" numeric(10,2),
            "comments" varchar,
            "selected" bool NOT NULL DEFAULT false,
            "userMerchantId" int4 NOT NULL,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6),
            "purchaseId" int4,
            "providerId" int4,
            "exitPortId" int4
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "ratio" (
            "id" serial NOT NULL PRIMARY KEY,
            "ratio" varchar NOT NULL
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "request_report" (
            "id" serial NOT NULL PRIMARY KEY,
            "reportType" int4 NOT NULL,
            "userId" int4 NOT NULL,
            "url" varchar NOT NULL,
            "status" varchar NOT NULL,
            "name" varchar NOT NULL,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6)
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "rse" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "active" bool NOT NULL DEFAULT true
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "season_commercial" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "active" bool DEFAULT true,
            "jdaCode" varchar,
            "shortName" varchar,
            "codeOC" varchar,
            "unitsEcomConfig" int4 DEFAULT 10
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "season_sticker" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "active" bool NOT NULL DEFAULT true
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "segment" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "active" bool NOT NULL DEFAULT true
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "shipmethod" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "active" bool NOT NULL DEFAULT true,
            "jdaCode" varchar
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "shipping_dates" (
            "id" serial NOT NULL PRIMARY KEY,
            "divisionId" int4 NOT NULL,
            "shipping" varchar NOT NULL,
            "date" timestamp(6) NOT NULL,
            "createdAt" timestamp(6) NOT NULL DEFAULT now(),
            "updatedAt" timestamp(6) NOT NULL DEFAULT now(),
            "seasonCommercialIdId" int4 NOT NULL,
            "originCountryIdId" int4 NOT NULL
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "shipping_dates_child" (
            "id" serial NOT NULL PRIMARY KEY,
            "divisionId" int4 NOT NULL,
            "days" int4 NOT NULL,
            "createdAt" timestamp(6) NOT NULL DEFAULT now(),
            "updatedAt" timestamp(6) NOT NULL DEFAULT now(),
            "seasonCommercialIdId" int4 NOT NULL,
            "originCountryIdId" int4 NOT NULL
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "size" (
            "id" serial NOT NULL PRIMARY KEY,
            "size" varchar NOT NULL,
            "code" varchar NOT NULL,
            "active" bool
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "size_jda" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "shortName" varchar NOT NULL,
            "jdaCode" varchar NOT NULL
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "sku" (
            "id" serial NOT NULL PRIMARY KEY,
            "styleId" integer NOT NULL,
            "code" varchar NOT NULL,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6),
            "providerId" int4 NOT NULL,
            "skuJdaMbrId" int4 NOT NULL
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "sku_color" (
            "id" serial NOT NULL PRIMARY KEY,
            "shortName" varchar NOT NULL,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6),
            "skuId" int4 NOT NULL,
            "styleColorId" int4 NOT NULL,
            "colorCode" int4 NOT NULL
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "sku_color_size" (
            "id" serial NOT NULL PRIMARY KEY,
            "sku" varchar,
            "ean" varchar,
            "atc" varchar,
            "ratio" int4 NOT NULL,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6),
            "skuColorId" int4 NOT NULL,
            "sizeJdaId" int4 NOT NULL,
            "sizeId" int4 NOT NULL,
            "datejda" varchar
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "sku_jda_mbr" (
            "id" serial NOT NULL PRIMARY KEY,
            "jdaMember" varchar NOT NULL,
            "createDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "updateDate" timestamptz(6) NOT NULL DEFAULT LOCALTIMESTAMP,
            "deleteDate" timestamptz(6),
            "userId" int4 NOT NULL DEFAULT '-1'::integer
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "status" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "status_purchase_color" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL
        );`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "store" (
            "id" serial NOT NULL PRIMARY KEY,
            "name" varchar NOT NULL,
            "shortName" varchar NOT NULL,
            "priority" int4 NOT NULL,
            "destinyCountryId" int4,
            "localCode" varchar NOT NULL DEFAULT ''::character varying,
            "ocCode" varchar NOT NULL DEFAULT ''::character varying
          );`);
        await queryRunner.query(`
        ALTER TABLE "cotization" DROP CONSTRAINT IF EXISTS "FK_b4adceacfeb6985dea0dc45f32e";
        ALTER TABLE "cotization" ADD CONSTRAINT "FK_b4adceacfeb6985dea0dc45f32e" FOREIGN KEY ("providerId") REFERENCES "provider" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "cotization" DROP CONSTRAINT IF EXISTS "FK_cba08813b78047243e067828ce5";
        ALTER TABLE "cotization" ADD CONSTRAINT "FK_cba08813b78047243e067828ce5" FOREIGN KEY ("exitPortId") REFERENCES "exit_port" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "cotization" DROP CONSTRAINT IF EXISTS "FK_dbd292e557dd52ec22b0e94b2a0";
        ALTER TABLE "cotization" ADD CONSTRAINT "FK_dbd292e557dd52ec22b0e94b2a0" FOREIGN KEY ("purchaseStyleId") REFERENCES "purchase_style" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "dollar_change" DROP CONSTRAINT IF EXISTS "FK_8ad38d219836e21e8c3e4ee5716";
        ALTER TABLE "dollar_change" ADD CONSTRAINT "FK_8ad38d219836e21e8c3e4ee5716" FOREIGN KEY ("seasonCommercialId") REFERENCES "season_commercial" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "dollar_change" DROP CONSTRAINT IF EXISTS "FK_eb58c581d9845f6b02651bd1bd0";
        ALTER TABLE "dollar_change" ADD CONSTRAINT "FK_eb58c581d9845f6b02651bd1bd0" FOREIGN KEY ("destinyCountryId") REFERENCES "destiny_country" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "ecom_units_config" DROP CONSTRAINT IF EXISTS "FK_d62b2e3f55b6f81f1bbd616c5e2";
        ALTER TABLE "ecom_units_config" ADD CONSTRAINT "FK_d62b2e3f55b6f81f1bbd616c5e2" FOREIGN KEY ("seasonCommercialId") REFERENCES "season_commercial" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "ecommerce_unit_config" DROP CONSTRAINT IF EXISTS "FK_0ea748926b6fb629dcf081b611c";
        ALTER TABLE "ecommerce_unit_config" ADD CONSTRAINT "FK_0ea748926b6fb629dcf081b611c" FOREIGN KEY ("seasonCommercialId") REFERENCES "season_commercial" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "import_factor" DROP CONSTRAINT IF EXISTS "FK_bba29460264ffb19fc22fdef20b";
        ALTER TABLE "import_factor" ADD CONSTRAINT "FK_bba29460264ffb19fc22fdef20b" FOREIGN KEY ("originCountryId") REFERENCES "origin_country" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "import_factor" DROP CONSTRAINT IF EXISTS "FK_e3e6aedc2e612dea9b36733a7c2";
        ALTER TABLE "import_factor" ADD CONSTRAINT "FK_e3e6aedc2e612dea9b36733a7c2" FOREIGN KEY ("shipmethodId") REFERENCES "shipmethod" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "import_factor" DROP CONSTRAINT IF EXISTS "FK_f58ffd34fb582a2c475fda38171";
        ALTER TABLE "import_factor" ADD CONSTRAINT "FK_f58ffd34fb582a2c475fda38171" FOREIGN KEY ("destinyCountryId") REFERENCES "destiny_country" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "provider" DROP CONSTRAINT IF EXISTS "FK_0b2df8c37ce210327768e8492b2";
        ALTER TABLE "provider" ADD CONSTRAINT "FK_0b2df8c37ce210327768e8492b2" FOREIGN KEY ("originCountryId") REFERENCES "origin_country" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase" DROP CONSTRAINT IF EXISTS "FK_44b6a662c10ae278723242087be";
        ALTER TABLE "purchase" ADD CONSTRAINT "FK_44b6a662c10ae278723242087be" FOREIGN KEY ("seasonCommercialId") REFERENCES "season_commercial" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase" DROP CONSTRAINT IF EXISTS "FK_8cda590ffa00d61f9c3d14e7b2e";
        ALTER TABLE "purchase" ADD CONSTRAINT "FK_8cda590ffa00d61f9c3d14e7b2e" FOREIGN KEY ("statusId") REFERENCES "status" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_store" DROP CONSTRAINT IF EXISTS "FK_96b606ca68df1f893c16e4d6444";
        ALTER TABLE "purchase_store" ADD CONSTRAINT "FK_96b606ca68df1f893c16e4d6444" FOREIGN KEY ("purchaseId") REFERENCES "purchase" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_store" DROP CONSTRAINT IF EXISTS "FK_c9baf2e1396e669ee90d899c37f";
        ALTER TABLE "purchase_store" ADD CONSTRAINT "FK_c9baf2e1396e669ee90d899c37f" FOREIGN KEY ("storeId") REFERENCES "store" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style" DROP CONSTRAINT IF EXISTS "FK_106e19fed588536be81265528ec";
        ALTER TABLE "purchase_style" ADD CONSTRAINT "FK_106e19fed588536be81265528ec" FOREIGN KEY ("purchaseStoreId") REFERENCES "purchase_store" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style" DROP CONSTRAINT IF EXISTS "FK_e347abae7b5d46db3a7205c0dfd";
        ALTER TABLE "purchase_style" ADD CONSTRAINT "FK_e347abae7b5d46db3a7205c0dfd" FOREIGN KEY ("statusId") REFERENCES "status_purchase_color" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_color" DROP CONSTRAINT IF EXISTS "FK_d17ea53cc13af9b23b06def4148";
        ALTER TABLE "purchase_style_color" ADD CONSTRAINT "FK_d17ea53cc13af9b23b06def4148" FOREIGN KEY ("purchaseStyleId") REFERENCES "purchase_style" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_color" DROP CONSTRAINT IF EXISTS "FK_f2f4c657f8f636666d0a5da20bf";
        ALTER TABLE "purchase_style_color" ADD CONSTRAINT "FK_f2f4c657f8f636666d0a5da20bf" FOREIGN KEY ("statusId") REFERENCES "status_purchase_color" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_color_shipping" DROP CONSTRAINT IF EXISTS "FK_061e87255e6d2b0864eee5404bb";
        ALTER TABLE "purchase_style_color_shipping" ADD CONSTRAINT "FK_061e87255e6d2b0864eee5404bb" FOREIGN KEY ("purchaseStyleColorId") REFERENCES "purchase_style_color" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_cotization" DROP CONSTRAINT IF EXISTS "FK_22c87922172456dd868dc77c6e5";
        ALTER TABLE "purchase_style_cotization" ADD CONSTRAINT "FK_22c87922172456dd868dc77c6e5" FOREIGN KEY ("purchaseStyleId") REFERENCES "purchase_style" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_cotization" DROP CONSTRAINT IF EXISTS "FK_264fb218a216d3e811421025c96";
        ALTER TABLE "purchase_style_cotization" ADD CONSTRAINT "FK_264fb218a216d3e811421025c96" FOREIGN KEY ("providerId") REFERENCES "provider" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_cotization" DROP CONSTRAINT IF EXISTS "FK_e24d15b8a3da06294a8954c3d05";
        ALTER TABLE "purchase_style_cotization" ADD CONSTRAINT "FK_e24d15b8a3da06294a8954c3d05" FOREIGN KEY ("exitPortId") REFERENCES "exit_port" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_29f5a92fd4c6b59e30a78d58e84";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_29f5a92fd4c6b59e30a78d58e84" FOREIGN KEY ("purchaseStyleId") REFERENCES "purchase_style" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_43aa8591840630d2ddf971ccbd6";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_43aa8591840630d2ddf971ccbd6" FOREIGN KEY ("purchaseStyleNegotiationId") REFERENCES "purchase_style_negotiation" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_5942dddf14de57418012054789c";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_5942dddf14de57418012054789c" FOREIGN KEY ("seasonStickerId") REFERENCES "season_sticker" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_7042ac976d96a440cbf3011d637";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_7042ac976d96a440cbf3011d637" FOREIGN KEY ("rseId") REFERENCES "rse" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_708cfcd6c1d516e053171414bd8";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_708cfcd6c1d516e053171414bd8" FOREIGN KEY ("shippingMethodId") REFERENCES "shipmethod" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_87660a5d2d1f5d4c9c8488f8fb9";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_87660a5d2d1f5d4c9c8488f8fb9" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_985c241e923fa4f98de308a3e36";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_985c241e923fa4f98de308a3e36" FOREIGN KEY ("segmentId") REFERENCES "segment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_a0a55f16fda7c8e59d1ff98a67e";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_a0a55f16fda7c8e59d1ff98a67e" FOREIGN KEY ("packingMethodId") REFERENCES "packaging" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_bffca5dff86852ca51e9ac3aa64";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_bffca5dff86852ca51e9ac3aa64" FOREIGN KEY ("exitPortId") REFERENCES "exit_port" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_c53901135a1edd063a6e1232671";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_c53901135a1edd063a6e1232671" FOREIGN KEY ("originId") REFERENCES "origin_country" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_c59e39038ffaceb83904de57461";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_c59e39038ffaceb83904de57461" FOREIGN KEY ("sizeId") REFERENCES "size" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_e409eecad28eda7ca44c5f732a8";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_e409eecad28eda7ca44c5f732a8" FOREIGN KEY ("csoId") REFERENCES "cso" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_ebd6b96d4009df4f680ae9ea3f5";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_ebd6b96d4009df4f680ae9ea3f5" FOREIGN KEY ("ratioId") REFERENCES "ratio" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_details" DROP CONSTRAINT IF EXISTS "FK_ef4ff8b97c623984f7891c2a157";
        ALTER TABLE "purchase_style_details" ADD CONSTRAINT "FK_ef4ff8b97c623984f7891c2a157" FOREIGN KEY ("providerId") REFERENCES "provider" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_negotiation" DROP CONSTRAINT IF EXISTS "FK_37be906205fa51a723166bc13e9";
        ALTER TABLE "purchase_style_negotiation" ADD CONSTRAINT "FK_37be906205fa51a723166bc13e9" FOREIGN KEY ("purchaseId") REFERENCES "purchase" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_negotiation" DROP CONSTRAINT IF EXISTS "FK_4f61cf01a0fcdcfd53d77169ce5";
        ALTER TABLE "purchase_style_negotiation" ADD CONSTRAINT "FK_4f61cf01a0fcdcfd53d77169ce5" FOREIGN KEY ("exitPortId") REFERENCES "exit_port" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "purchase_style_negotiation" DROP CONSTRAINT IF EXISTS "FK_f4c81932dc2e78e6f8b47420437";
        ALTER TABLE "purchase_style_negotiation" ADD CONSTRAINT "FK_f4c81932dc2e78e6f8b47420437" FOREIGN KEY ("providerId") REFERENCES "provider" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "shipping_dates" DROP CONSTRAINT IF EXISTS "FK_9f94f7b4cd405c54f0bdd56231b";
        ALTER TABLE "shipping_dates" ADD CONSTRAINT "FK_9f94f7b4cd405c54f0bdd56231b" FOREIGN KEY ("seasonCommercialIdId") REFERENCES "season_commercial" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "shipping_dates" DROP CONSTRAINT IF EXISTS "FK_ec6fe624d3557d54bb9ca6c71cf";
        ALTER TABLE "shipping_dates" ADD CONSTRAINT "FK_ec6fe624d3557d54bb9ca6c71cf" FOREIGN KEY ("originCountryIdId") REFERENCES "origin_country" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "shipping_dates_child" DROP CONSTRAINT IF EXISTS "FK_1f4d877d08b1f6efaee940bc386";
        ALTER TABLE "shipping_dates_child" ADD CONSTRAINT "FK_1f4d877d08b1f6efaee940bc386" FOREIGN KEY ("originCountryIdId") REFERENCES "origin_country" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "shipping_dates_child" DROP CONSTRAINT IF EXISTS "FK_a099ac0d3b3232098e4373c6672";
        ALTER TABLE "shipping_dates_child" ADD CONSTRAINT "FK_a099ac0d3b3232098e4373c6672" FOREIGN KEY ("seasonCommercialIdId") REFERENCES "season_commercial" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "sku" DROP CONSTRAINT IF EXISTS "FK_3a87fcb229e7de2832d5702f310";
        ALTER TABLE "sku" ADD CONSTRAINT "FK_3a87fcb229e7de2832d5702f310" FOREIGN KEY ("skuJdaMbrId") REFERENCES "sku_jda_mbr" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "sku" DROP CONSTRAINT IF EXISTS "FK_b94869da36da74d5c523c683395";
        ALTER TABLE "sku" ADD CONSTRAINT "FK_b94869da36da74d5c523c683395" FOREIGN KEY ("providerId") REFERENCES "provider" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "sku_color" DROP CONSTRAINT IF EXISTS "FK_c8672f802c8a0f37446fb199f51";
        ALTER TABLE "sku_color" ADD CONSTRAINT "FK_c8672f802c8a0f37446fb199f51" FOREIGN KEY ("skuId") REFERENCES "sku" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "sku_color_size" DROP CONSTRAINT IF EXISTS "FK_069526bc87e6ad6149deda45662";
        ALTER TABLE "sku_color_size" ADD CONSTRAINT "FK_069526bc87e6ad6149deda45662" FOREIGN KEY ("sizeJdaId") REFERENCES "size_jda" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "sku_color_size" DROP CONSTRAINT IF EXISTS "FK_089a761b0efb19a4069fa7b3863";
        ALTER TABLE "sku_color_size" ADD CONSTRAINT "FK_089a761b0efb19a4069fa7b3863" FOREIGN KEY ("skuColorId") REFERENCES "sku_color" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "sku_color_size" DROP CONSTRAINT IF EXISTS "FK_a079b12a5aa0b3573c7e2a04b16";
        ALTER TABLE "sku_color_size" ADD CONSTRAINT "FK_a079b12a5aa0b3573c7e2a04b16" FOREIGN KEY ("sizeId") REFERENCES "size" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        await queryRunner.query(`
        ALTER TABLE "store" DROP CONSTRAINT IF EXISTS "FK_50e097a4c7a992c0dd01e39192f";
        ALTER TABLE "store" ADD CONSTRAINT "FK_50e097a4c7a992c0dd01e39192f" FOREIGN KEY ("destinyCountryId") REFERENCES "destiny_country" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`);
        
        await queryRunner.query(`INSERT INTO "category" values (1, 'DENIM', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "category" values (2, 'KNIT', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "category" values (3, 'OUTERWEAR', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "category" values (5, 'SWEATER', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "category" values (6, 'SWIMWEAR', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "category" values (7, 'WOVEN', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "category" values (16, 'SHOES', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "category" values (17, 'reerrettre', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "category" values (18, 'sdasdadsads', false) ON CONFLICT DO NOTHING;`);

        await queryRunner.query(`INSERT INTO "cso" values(1, 'CSO', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "cso" values(2, 'CBO', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "cso" values(3, 'DIRECT', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "cso" values(4, 'cso prueba', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "cso" values(5, '2', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "cso" values(6, 'prubeasdfgdfgd', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "cso" values(7, 'prueba1', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "cso" values(8, 'hola mundo editado', false) ON CONFLICT DO NOTHING;`);

        await queryRunner.query(`INSERT INTO "destiny_country" values (1, 'CHILE', 'CL', 19) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "destiny_country" values (2, 'ERU', 'PE', 18) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "destiny_country" values (3, 'BRASIL', 'BR', 19) ON CONFLICT DO NOTHING;`);

        await queryRunner.query(`INSERT INTO "origin_country" values (1, 'Argentina', 'AR', 0) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "origin_country" values (2, 'Perú', 'PE', 0) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "origin_country" values (3, 'Brasil', 'BR', 0) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "origin_country" values (4, 'China', 'CN', 0) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "origin_country" values (5, 'Panamá', 'PA', 0) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "origin_country" values (6, 'Bangladesh', 'BD', 0) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "origin_country" values (7, 'Chile', 'CL', 0) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "origin_country" values (8, 'Italia', 'IT', 0) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "origin_country" values (9, 'India', 'IN', 0) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "origin_country" values (10, 'Inglaterra', 'GB', 0) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "origin_country" values (11, 'Pakistán', 'PK', 0) ON CONFLICT DO NOTHING;`);

        await queryRunner.query(`INSERT INTO "rse" values (1, 'YES', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (2, 'NO', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (3, 'Oeko Tek', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (4, 'Reprieve', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (5, 'Polyester Reciclado', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (6, 'Algodón Orgánico', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (7, 'BCI', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (8, 'Tencel', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (9, 'Ahorro Agua', true) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (12, 'prueba 2', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (11, 'prueba', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (14, 'prueba rse', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (13, '23ddcfd', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (10, 'dede2', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (16, 'fijono2', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (15, 'fijo', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (17, 'prueba', false) ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "rse" values (18, 'VISCOSA RECICLADA', true) ON CONFLICT DO NOTHING;`);

        await queryRunner.query(`INSERT INTO "store" values (1, 'JHONSON', 'JH', 3, 1, '', '') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "store" values (2, 'TIENDAS PROPIAS', 'TP', 5, 1, '', '') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "store" values (3, 'PARIS', 'PA', 1, 1, '', '') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "store" values (4, 'PARIS E-COMMERCE', 'PW', 2, 1, '', '') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "store" values (5, 'PARIS PERU', 'PA', 6, 2, '', '') ON CONFLICT DO NOTHING;`);

        await queryRunner.query(`INSERT INTO "status" values (1, 'Datos Generales') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status" values (2, 'Selección de estilos') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status" values (3, 'Editar Destinos') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status" values (4, 'Selección Unidades Entrega') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status" values (5, 'Editar Detalles de Estilos') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status" values (6, 'Editar Detalles Opcionales') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status" values (7, 'Compra completada') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status" values (8, 'Aprobado') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status" values (9, 'Pendiente Negociación') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status" values (10, 'Cotizaciones') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status" values (11, 'Negociado') ON CONFLICT DO NOTHING;`);

        await queryRunner.query(`INSERT INTO "status_purchase_color" values (1, 'Confirmado') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status_purchase_color" values (2, 'Cancelado') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status_purchase_color" values (3, 'Pendiente') ON CONFLICT DO NOTHING;`);
        await queryRunner.query(`INSERT INTO "status_purchase_color" values (4, 'Negociado') ON CONFLICT DO NOTHING;`);

    }

    public async down(queryRunner: QueryRunner): Promise<any> {

        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_44b6a662c10ae278723242087be";`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_8cda590ffa00d61f9c3d14e7b2e";`);
        await queryRunner.query(`ALTER TABLE "purchase_store" DROP CONSTRAINT "FK_96b606ca68df1f893c16e4d6444";`);
        await queryRunner.query(`ALTER TABLE "purchase_store" DROP CONSTRAINT "FK_c9baf2e1396e669ee90d899c37f";`);
        await queryRunner.query(`ALTER TABLE "purchase_style" DROP CONSTRAINT "FK_106e19fed588536be81265528ec";`);
        await queryRunner.query(`ALTER TABLE "purchase_style" DROP CONSTRAINT "FK_e347abae7b5d46db3a7205c0dfd";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_color" DROP CONSTRAINT "FK_d17ea53cc13af9b23b06def4148";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_color" DROP CONSTRAINT "FK_f2f4c657f8f636666d0a5da20bf";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_color_shipping" DROP CONSTRAINT "FK_061e87255e6d2b0864eee5404bb";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_cotization" DROP CONSTRAINT "FK_22c87922172456dd868dc77c6e5";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_cotization" DROP CONSTRAINT "FK_264fb218a216d3e811421025c96";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_cotization" DROP CONSTRAINT "FK_e24d15b8a3da06294a8954c3d05";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_29f5a92fd4c6b59e30a78d58e84";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_43aa8591840630d2ddf971ccbd6";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_5942dddf14de57418012054789c";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_7042ac976d96a440cbf3011d637";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_708cfcd6c1d516e053171414bd8";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_87660a5d2d1f5d4c9c8488f8fb9";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_985c241e923fa4f98de308a3e36";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_a0a55f16fda7c8e59d1ff98a67e";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_bffca5dff86852ca51e9ac3aa64";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_c53901135a1edd063a6e1232671";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_c59e39038ffaceb83904de57461";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_e409eecad28eda7ca44c5f732a8";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_ebd6b96d4009df4f680ae9ea3f5";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "FK_ef4ff8b97c623984f7891c2a157";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_negotiation" DROP CONSTRAINT "FK_37be906205fa51a723166bc13e9";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_negotiation" DROP CONSTRAINT "FK_4f61cf01a0fcdcfd53d77169ce5";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_negotiation" DROP CONSTRAINT "FK_f4c81932dc2e78e6f8b47420437";`);
        await queryRunner.query(`ALTER TABLE "cotization" DROP CONSTRAINT "FK_cba08813b78047243e067828ce5";`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_50e097a4c7a992c0dd01e39192f";`);
        await queryRunner.query(`ALTER TABLE "cotization" DROP CONSTRAINT "FK_b4adceacfeb6985dea0dc45f32e";`);
        await queryRunner.query(`ALTER TABLE "cotization" DROP CONSTRAINT "FK_dbd292e557dd52ec22b0e94b2a0";`);
        await queryRunner.query(`ALTER TABLE "dollar_change" DROP CONSTRAINT "FK_8ad38d219836e21e8c3e4ee5716";`);
        await queryRunner.query(`ALTER TABLE "dollar_change" DROP CONSTRAINT "FK_eb58c581d9845f6b02651bd1bd0";`);
        await queryRunner.query(`ALTER TABLE "ecom_units_config" DROP CONSTRAINT "FK_d62b2e3f55b6f81f1bbd616c5e2";`);
        await queryRunner.query(`ALTER TABLE "ecommerce_unit_config" DROP CONSTRAINT "FK_0ea748926b6fb629dcf081b611c";`);
        await queryRunner.query(`ALTER TABLE "import_factor" DROP CONSTRAINT "FK_bba29460264ffb19fc22fdef20b";`);
        await queryRunner.query(`ALTER TABLE "import_factor" DROP CONSTRAINT "FK_e3e6aedc2e612dea9b36733a7c2";`);
        await queryRunner.query(`ALTER TABLE "import_factor" DROP CONSTRAINT "FK_f58ffd34fb582a2c475fda38171";`);
        await queryRunner.query(`ALTER TABLE "provider" DROP CONSTRAINT "FK_0b2df8c37ce210327768e8492b2";`);
        await queryRunner.query(`ALTER TABLE "shipping_dates" DROP CONSTRAINT "FK_9f94f7b4cd405c54f0bdd56231b";`);
        await queryRunner.query(`ALTER TABLE "shipping_dates" DROP CONSTRAINT "FK_ec6fe624d3557d54bb9ca6c71cf";`);
        await queryRunner.query(`ALTER TABLE "shipping_dates_child" DROP CONSTRAINT "FK_1f4d877d08b1f6efaee940bc386";`);
        await queryRunner.query(`ALTER TABLE "shipping_dates_child" DROP CONSTRAINT "FK_a099ac0d3b3232098e4373c6672";`);
        await queryRunner.query(`ALTER TABLE "sku" DROP CONSTRAINT "FK_3a87fcb229e7de2832d5702f310";`);
        await queryRunner.query(`ALTER TABLE "sku" DROP CONSTRAINT "FK_b94869da36da74d5c523c683395";`);
        await queryRunner.query(`ALTER TABLE "sku_color" DROP CONSTRAINT "FK_c8672f802c8a0f37446fb199f51";`);
        await queryRunner.query(`ALTER TABLE "sku_color_size" DROP CONSTRAINT "FK_069526bc87e6ad6149deda45662";`);
        await queryRunner.query(`ALTER TABLE "sku_color_size" DROP CONSTRAINT "FK_089a761b0efb19a4069fa7b3863";`);
        await queryRunner.query(`ALTER TABLE "sku_color_size" DROP CONSTRAINT "FK_a079b12a5aa0b3573c7e2a04b16";`);

        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "PK_86cc2ebeb9e17fc9c0774b05f69";`);
        await queryRunner.query(`ALTER TABLE "purchase_store" DROP CONSTRAINT "PK_7d73750e13e9ae7f7aef5d94064";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_color" DROP CONSTRAINT "PK_244a2638865d4b28ecd79e066e3";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_color_shipping" DROP CONSTRAINT "PK_d69915afb06f23f5177d9a2a439";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_cotization" DROP CONSTRAINT "PK_bebee991686d8bad119d8b135c0";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_details" DROP CONSTRAINT "PK_5cae32457a309b0438eaebea522";`);
        await queryRunner.query(`ALTER TABLE "purchase_style_negotiation" DROP CONSTRAINT "PK_ca747061fdce526cad3c0e2c776";`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03";`);
        await queryRunner.query(`ALTER TABLE "cotization" DROP CONSTRAINT "PK_febff7ecff094a4ea03824576a0";`);
        await queryRunner.query(`ALTER TABLE "cso" DROP CONSTRAINT "PK_0f8c469bca96b70a1bf87fed2a8";`);
        await queryRunner.query(`ALTER TABLE "designer" DROP CONSTRAINT "PK_01555ea181fd3d479d5e75bed35";`);
        await queryRunner.query(`ALTER TABLE "dollar_change" DROP CONSTRAINT "PK_313744cc4d5b90d82596c975339";`);
        await queryRunner.query(`ALTER TABLE "ecom_units_config" DROP CONSTRAINT "PK_2192d525302efb93ed79bae421b";`);
        await queryRunner.query(`ALTER TABLE "ecommerce_unit_config" DROP CONSTRAINT "PK_3fdded3a0c5d728ec77839f3f17";`);
        await queryRunner.query(`ALTER TABLE "exit_port" DROP CONSTRAINT "PK_d5de46550f2fc8683052dd3201c";`);
        await queryRunner.query(`ALTER TABLE "import_factor" DROP CONSTRAINT "PK_fd955b52b46c384f82919df942a";`);
        await queryRunner.query(`ALTER TABLE "migrations" DROP CONSTRAINT "PK_8c82d7f526340ab734260ea46be";`);
        await queryRunner.query(`ALTER TABLE "origin_country" DROP CONSTRAINT "PK_01efdea2526e9e7f45b97c362ad";`);
        await queryRunner.query(`ALTER TABLE "packaging" DROP CONSTRAINT "PK_c555edac95babf9a092ff829eba";`);
        await queryRunner.query(`ALTER TABLE "packing_method" DROP CONSTRAINT "PK_9c05e099e6ff58194865157ebc0";`);
        await queryRunner.query(`ALTER TABLE "payment_terms" DROP CONSTRAINT "PK_a7e7ab8cabd8982c57d817b7164";`);
        await queryRunner.query(`ALTER TABLE "payment_time" DROP CONSTRAINT "PK_6eb2017338e57cd0a4f1ffcdc04";`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb";`);
        await queryRunner.query(`ALTER TABLE "provider" DROP CONSTRAINT "PK_6ab2f66d8987bf1bfdd6136a2d5";`);
        await queryRunner.query(`ALTER TABLE "ratio" DROP CONSTRAINT "PK_9e8320a0161e1eceb5f38e316c3";`);
        await queryRunner.query(`ALTER TABLE "request_report" DROP CONSTRAINT "PK_0c224d3c050ff241390da56f127";`);
        await queryRunner.query(`ALTER TABLE "rse" DROP CONSTRAINT "PK_5aa60456396fdf47189b8340a74";`);
        await queryRunner.query(`ALTER TABLE "season_commercial" DROP CONSTRAINT "PK_bc8cc1c329c1806aeb18f6f16ab";`);
        await queryRunner.query(`ALTER TABLE "season_sticker" DROP CONSTRAINT "PK_2cb7bd9e5d189dfefd0bf8813e3";`);
        await queryRunner.query(`ALTER TABLE "segment" DROP CONSTRAINT "PK_d648ac58d8e0532689dfb8ad7ef";`);
        await queryRunner.query(`ALTER TABLE "shipmethod" DROP CONSTRAINT "PK_e121623996a37ef90970e642a06";`);
        await queryRunner.query(`ALTER TABLE "shipping_dates" DROP CONSTRAINT "PK_abe5554dd08d81405f244888c25";`);
        await queryRunner.query(`ALTER TABLE "shipping_dates_child" DROP CONSTRAINT "PK_793546adb8e95dc47d2e5d36c69";`);
        await queryRunner.query(`ALTER TABLE "size" DROP CONSTRAINT "PK_66e3a0111d969aa0e5f73855c7a";`);
        await queryRunner.query(`ALTER TABLE "size_jda" DROP CONSTRAINT "PK_67425b4b76314a76296bba0a7e1";`);
        await queryRunner.query(`ALTER TABLE "sku" DROP CONSTRAINT "PK_ed102ac07c2cbc14c9a1438ecc2";`);
        await queryRunner.query(`ALTER TABLE "sku_color" DROP CONSTRAINT "PK_b692187a3294a519f0b0223aa84";`);
        await queryRunner.query(`ALTER TABLE "sku_color_size" DROP CONSTRAINT "PK_4727769068b817048aa3a704c62";`);
        await queryRunner.query(`ALTER TABLE "sku_jda_mbr" DROP CONSTRAINT "PK_c4acff88de134fa253d300ddeec";`);
        await queryRunner.query(`ALTER TABLE "status" DROP CONSTRAINT "PK_e12743a7086ec826733f54e1d95";`);
        await queryRunner.query(`ALTER TABLE "status_purchase_color" DROP CONSTRAINT "PK_6f66127ac00e7502ad652830926";`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "PK_f3172007d4de5ae8e7692759d79";`);
        await queryRunner.query(`ALTER TABLE "purchase_style" DROP CONSTRAINT "PK_24a01f6a3381e9e427ddad49160";`);
        await queryRunner.query(`ALTER TABLE "destiny_country" DROP CONSTRAINT "PK_7ccdec83d35fccfaa066981db35";`);
        
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "cotization"`);
        await queryRunner.query(`DROP TABLE "cso"`);
        await queryRunner.query(`DROP TABLE "designer"`);
        await queryRunner.query(`DROP TABLE "destiny_country"`);
        await queryRunner.query(`DROP TABLE "dollar_change"`);
        await queryRunner.query(`DROP TABLE "ecom_units_config"`);
        await queryRunner.query(`DROP TABLE "ecommerce_unit_config" `);
        await queryRunner.query(`DROP TABLE "exit_port"`);
        await queryRunner.query(`DROP TABLE "import_factor"`);
        await queryRunner.query(`DROP TABLE "origin_country"`);
        await queryRunner.query(`DROP TABLE "packaging" `);
        await queryRunner.query(`DROP TABLE "packing_method"`);
        await queryRunner.query(`DROP TABLE "payment_terms"`);
        await queryRunner.query(`DROP TABLE "payment_time"`);
        await queryRunner.query(`DROP TABLE "profile"`);
        await queryRunner.query(`DROP TABLE "provider"`);
        await queryRunner.query(`DROP TABLE "purchase"`);
        await queryRunner.query(`DROP TABLE "purchase_store"`);
        await queryRunner.query(`DROP TABLE "purchase_style"`);
        await queryRunner.query(`DROP TABLE "purchase_style_color"`);
        await queryRunner.query(`DROP TABLE "purchase_style_color_shipping"`);
        await queryRunner.query(`DROP TABLE "purchase_style_cotization"`);
        await queryRunner.query(`DROP TABLE "purchase_style_details"`);
        await queryRunner.query(`DROP TABLE "purchase_style_negotiation"`);
        await queryRunner.query(`DROP TABLE "ratio"`);
        await queryRunner.query(`DROP TABLE "request_report"`);
        await queryRunner.query(`DROP TABLE "rse"`);
        await queryRunner.query(`DROP TABLE "season_commercial"`);
        await queryRunner.query(`DROP TABLE "season_sticker"`);
        await queryRunner.query(`DROP TABLE "segment"`);
        await queryRunner.query(`DROP TABLE "shipmethod"`);
        await queryRunner.query(`DROP TABLE "shipping_dates"`);
        await queryRunner.query(`DROP TABLE "shipping_dates_child"`);
        await queryRunner.query(`DROP TABLE "size"`);
        await queryRunner.query(`DROP TABLE "size_jda"`);
        await queryRunner.query(`DROP TABLE "sku"`);
        await queryRunner.query(`DROP TABLE "sku_color"`);
        await queryRunner.query(`DROP TABLE "sku_color_size"`);
        await queryRunner.query(`DROP TABLE "sku_jda_mbr"`);
        await queryRunner.query(`DROP TABLE "status"`);
        await queryRunner.query(`DROP TABLE "status_purchase_color"`);
        await queryRunner.query(`DROP TABLE "store"`);
    }

}
