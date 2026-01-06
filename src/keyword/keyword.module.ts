import { Module } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { KeywordController } from './keyword.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeywordEntity } from './entities/keyword.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, KeywordEntity])],
  controllers: [KeywordController],
  providers: [KeywordService],
})
export class KeywordModule {}
