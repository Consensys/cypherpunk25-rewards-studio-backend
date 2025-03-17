export class PhosphorNftMetadata {
  title: string;
  description?: string;
  image_url?: string;
  //... any custom fields for NFT metadata
  [others: string]: any;
}

export class PhosphorNftPassChallengeSummary {
  challenge_id: string;
  challenge_name: string;
  challenge_points: number = 0;
  challenge_completed: boolean = false;
  challenge_timestamp?: Date;
}

export class PhosphorNftPassMetadata extends PhosphorNftMetadata {
  points_earned: number = 0;
  campaign_completed: boolean = false;
  challenges_summary?: PhosphorNftPassChallengeSummary[] = [];
  challenges_summary_json: string;

  sync() {
    this.syncCampaignCompleted();
    this.syncPointsEarned();
  }

  private syncCampaignCompleted() {
    if (this.challenges_summary && this.challenges_summary.length > 0) {
      this.campaign_completed =
        this.challenges_summary?.filter((c) => c.challenge_completed).length ===
        this.challenges_summary?.length;
    } else {
      this.campaign_completed = false;
    }
  }

  private syncPointsEarned() {
    this.points_earned =
      this.challenges_summary?.reduce(
        (acc, curr) => acc + curr.challenge_points,
        0,
      ) ?? 0;
  }
}

export class PhosphorNftPass {
  itemId: string;
  tokenId: number;
  collectionId: string;
  contractAddress: string;
  chainId: number;
  metadata?: PhosphorNftPassMetadata;
}
