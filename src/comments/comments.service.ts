import { Inject, Injectable } from '@nestjs/common';
import { COMMENT_REPOSITORY_TOKEN } from './comments.providers';
import { Comment } from 'src/models/comments.model';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from 'src/models/user.model';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(COMMENT_REPOSITORY_TOKEN)
    private readonly commentsRepository: typeof Comment,
  ) {}

  async create(user: User, createCommentDto: CreateCommentDto) {
    const comment = await this.commentsRepository.create({
      ...createCommentDto,
      userId: user.id,
    });
    return comment;
  }

  async findAll(postId: string) {
    const comments = await this.commentsRepository.findAll({
      where: { postId },
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return this.buildCommentTree(comments);
  }

  private buildCommentTree(comments: Comment[]): any[] {
    // Tạo map để tìm comments nhanh theo id
    const commentMap = new Map<string, any>();

    // Khởi tạo tất cả comments với mảng replies rỗng
    comments.forEach((comment) => {
      commentMap.set(comment.id, {
        ...comment.toJSON(),
        replies: [],
      });
    });

    const rootComments: any[] = [];

    // Duyệt qua tất cả comments để build tree
    comments.forEach((comment) => {
      const commentData = commentMap.get(comment.id);

      if (!comment.parentId) {
        // Comment gốc (không có parent)
        rootComments.push(commentData);
      } else {
        // Comment reply - thêm vào replies của parent
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          parentComment.replies.push(commentData);
        }
      }
    });

    return rootComments;
  }
}
