import { Module } from '@nestjs/common'
import { AvatarController, AvatarFileController } from './avatar.controller'
import { AvatarService } from './avatar.service'

@Module({
  controllers: [AvatarController, AvatarFileController],
  providers: [AvatarService],
})
export class AvatarModule {}
