import { Post } from 'src/models/post.model';

export const POST_REPOSITORY_TOKEN = 'POSTS_REPOSITORY';

export const postsProviders = [
  {
    provide: POST_REPOSITORY_TOKEN,
    useValue: Post,
  },
];
