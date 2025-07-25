import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Comment } from 'src/models/comments.model';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from 'src/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { ReactionsService } from 'src/reactions/reactions.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment)
    private readonly commentsRepository: typeof Comment,
    @Inject(forwardRef(() => ReactionsService))
    private readonly reactionsService: ReactionsService,
  ) {}

  async create(user: User, createCommentDto: CreateCommentDto) {
    const comment = await this.commentsRepository.create({
      ...createCommentDto,
      userId: user.id,
    });

    return comment;
  }

  async findAll(postId: string, user?: User) {
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

    await this.setIsLiked(comments, user);

    return this.buildCommentTree(comments);
  }

  async findById(id: string) {
    return await this.commentsRepository.findByPk(id);
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

  private async setIsLiked(comments: Comment[], user?: User) {
    if (user && comments.length > 0) {
      const commentIds = comments.map((comment) => comment.id);
      const userReactions =
        await this.reactionsService.getUserReactionsForComments(
          user.id,
          commentIds,
        );
      const reactionMap = new Map(userReactions.map((r) => [r.targetId, true]));

      comments.forEach((comment) => {
        comment.setDataValue('isLiked', reactionMap.has(comment.id));
      });
    } else {
      comments.forEach((comment) => {
        comment.setDataValue('isLiked', false);
      });
    }
  }
}
