import { Body, Controller, Post } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CurrentUser } from 'src/commons/decorators/current-user.decorator';
import { User } from 'src/models/user.model';
import { ToggleReactionDto } from './dtos/toggle-reaction.dto';
import { ResponseMessage } from 'src/commons/decorators/response-message.decorator';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('toggle')
  @ResponseMessage('Toggle reaction success')
  async toggle(
    @CurrentUser() user: User,
    @Body() toggleReactionDto: ToggleReactionDto,
  ) {
    return this.reactionsService.toggle(user.id, toggleReactionDto);
  }
}
