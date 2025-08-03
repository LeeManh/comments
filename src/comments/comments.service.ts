import { Injectable } from '@nestjs/common';
import { Comment } from 'src/models/comments.model';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from 'src/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment)
    private readonly commentsRepository: typeof Comment,
  ) {}

  async create(user: User, createCommentDto: CreateCommentDto) {
    const comment = await this.commentsRepository.create({
      ...createCommentDto,
      userId: user.id,
    });

    return comment;
  }

  async findAll(postId: string, user?: User) {
    const { rows: comments, count } =
      await this.commentsRepository.findAndCountAll({
        where: { postId },
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'avatar'],
          },
        ],
        attributes: {
          include: [
            [
              Sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments AS replies
              WHERE replies."parentId" = "Comment"."id"
            )`),
              'commentsCount',
            ],
          ],
        },
        order: [['createdAt', 'DESC']],
      });

    const commentTree = this.buildCommentTree(comments);

    return {
      data: commentTree,
      meta: { total: count },
    };
  }

  async findById(id: string) {
    return await this.commentsRepository.findByPk(id);
  }

  private buildCommentTree(comments: Comment[]): any[] {
    // Tạo map để tìm comments nhanh theo id
    const commentMap = new Map<string, any>();

    // Khởi tạo tất cả comments với mảng replies rỗng
    comments.forEach((comment) => {
      const commentData = comment.toJSON();

      commentMap.set(comment.id, {
        ...comment.toJSON(),
        replies: [],
        user: commentData.user || comment.user,
        commentsCount: Number(comment.getDataValue('commentsCount') || 0),
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
