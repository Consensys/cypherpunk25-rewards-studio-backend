-- CreateTable
CREATE TABLE "reward_distribution" (
    "id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "distributed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_distribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reward_distribution_campaign_id_reward_id_address_idx" ON "reward_distribution"("campaign_id", "reward_id", "address");

-- AddForeignKey
ALTER TABLE "reward_distribution" ADD CONSTRAINT "reward_distribution_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_distribution" ADD CONSTRAINT "reward_distribution_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
