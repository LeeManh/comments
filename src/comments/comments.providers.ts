import { Comment } from 'src/models/comments.model';

export const COMMENT_REPOSITORY_TOKEN = 'COMMENTS_REPOSITORY';

export const commentsProviders = [
  {
    provide: COMMENT_REPOSITORY_TOKEN,
    useValue: Comment,
  },
];
