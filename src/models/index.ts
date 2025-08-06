import { User } from './user.model';
import { Post } from './post.model';
import { Comment } from './comments.model';
import { RefreshToken } from './refresh-token.model';
import { Like } from './like.model';
import { Series } from './series.model';
import { Bookmark } from './bookmark.model';
import { Activity } from './activity.model';
import { Tag } from './tag.model';
import { PostTag } from './post-tags.model';
import { SeriesTags } from './series-tags.model';

export const models = [
  User,
  Post,
  Comment,
  RefreshToken,
  Like,
  Series,
  Bookmark,
  Activity,
  Tag,
  PostTag,
  SeriesTags,
];
