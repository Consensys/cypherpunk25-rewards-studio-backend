-- CreateTable
CREATE TABLE "campaign" (
    "id" TEXT NOT NULL,
    "phosphor_org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_uri" TEXT,
    "phosphor_drop_id" TEXT,
    "phosphor_contract_address" TEXT,
    "phosphor_listing_id" TEXT,
    "phosphor_chain_id" INTEGER,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3),

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_uri" TEXT,
    "operator" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER,
    "type_data" JSON NOT NULL,
    "starts_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_success" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "points" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_success_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "challenge_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_uri" TEXT,
    "type" TEXT NOT NULL,
    "type_data" JSON NOT NULL,
    "condition_type" TEXT NOT NULL,
    "condition_type_data" JSON NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner" (
    "id" TEXT NOT NULL,
    "title" JSON NOT NULL,
    "subtitle" JSON,
    "image_uri" TEXT,
    "link_uri" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3),

    CONSTRAINT "banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_phosphor_org_id_name_key" ON "campaign"("phosphor_org_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_campaign_id_name_key" ON "challenge"("campaign_id", "name");

-- CreateIndex
CREATE INDEX "challenge_success_campaign_id_challenge_id_address_idx" ON "challenge_success"("campaign_id", "challenge_id", "address");

-- CreateIndex
CREATE UNIQUE INDEX "reward_challenge_id_key" ON "reward"("challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "reward_campaign_id_name_condition_type_key" ON "reward"("campaign_id", "name", "condition_type");

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_success" ADD CONSTRAINT "challenge_success_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_success" ADD CONSTRAINT "challenge_success_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward" ADD CONSTRAINT "reward_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward" ADD CONSTRAINT "reward_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
