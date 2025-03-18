import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  create(createMemberDto: CreateMemberDto) {
    return 'This action adds a new member';
  }

  findAll() {
    return `This action returns all members`;
  }

  findOne(id: string) {
    return `This action returns a #${id} member`;
  }

  update(id: string, updateMemberDto: UpdateMemberDto) {
    return `This action updates a #${id} member`;
  }

  remove(id: string) {
    return `This action removes a #${id} member`;
  }
}
