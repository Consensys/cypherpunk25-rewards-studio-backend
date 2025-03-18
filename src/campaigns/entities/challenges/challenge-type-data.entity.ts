import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEthereumAddress,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
export class ChallengeTypeData {
  @ApiPropertyOptional({ description: 'Contract address of the NFT to hold' })
  @IsEthereumAddress()
  @IsOptional()
  contractAddress?: string;

  @ApiPropertyOptional({
    description: 'Chain ID where challenge is expected to be completed',
  })
  @IsNumber()
  @IsOptional()
  chainId?: number;

  @ApiPropertyOptional({
    description: 'Minimum number of NFTs to hold to complete this challenge',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  minimumHeldNfts?: number;

  @ApiPropertyOptional({
    description: 'Minimum number of MetaMask swaps to complete this challenge',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  minimumMetaMaskSwaps?: number;

  @ApiPropertyOptional({
    description:
      'Minimum number of MetaMask bridges to complete this challenge',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  minimumMetaMaskBridges?: number;

  @ApiPropertyOptional({
    description: 'Datetime after which the challenge starts to be validated',
  })
  @IsDateString()
  @IsOptional()
  transactionMinimumTimestamp?: Date;
}
