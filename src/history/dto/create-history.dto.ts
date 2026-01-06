import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';

export class CreateHistoryDto {
    
    user: UserEntity;
    wo: WoEntity;
    
    @IsString()
    description: string;

}
