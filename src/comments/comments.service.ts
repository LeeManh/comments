import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Comment } from 'src/models/comments.model';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from 'src/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Literal } from 'sequelize/types/utils';
import { LikeTargetType } from 'src/commons/constants/like.constant';
import { FindAttributeOptions } from 'sequelize';
import { CommentTargetType } from 'src/commons/constants/comment.constant';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_NAME } from 'src/commons/constants/event.constant';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment)
    private readonly commentsRepository: typeof Comment,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(user: User, createCommentDto: CreateCommentDto) {
    const comment = await this.commentsRepository.create({
      ...createCommentDto,
      userId: user.id,
    });

    return comment;
  }

  async findAll(targetId: string, targetType: CommentTargetType, user?: User) {
    const { rows: comments, count } =
      await this.commentsRepository.findAndCountAll({
        where: { targetId, targetType },
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'avatar', 'displayName'],
          },
        ],
        attributes: this.getCommentAttributes(user?.id),
        order: [['createdAt', 'DESC']],
      });

    const commentTree = this.buildCommentTree(comments);

    return {
      data: commentTree,
      meta: { total: count },
    };
  }

  async findOneById(id: string) {
    return this.commentsRepository.findByPk(id);
  }

  async delete(userId: string, id: string) {
    const comment = await this.commentsRepository.findByPk(id);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId)
      throw new ForbiddenException('You are not the owner of this comment');

    await comment.destroy();

    this.eventEmitter.emit(EVENT_NAME.COMMENT.DELETED, id);
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
        commentCount: Number(comment.getDataValue('commentCount') || 0),
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

  private getLikeCountAttributes(): [Literal, string][] {
    return [
      [
        this.commentsRepository.sequelize.literal(`(
          SELECT CAST(COUNT(*) AS INTEGER) 
          FROM likes
          WHERE likes."targetId" = "Comment".id
          AND likes."targetType" = ${LikeTargetType.COMMENT}
          AND likes."isDislike" = false
        )`),
        'likeCount',
      ],
      [
        this.commentsRepository.sequelize.literal(`(
          SELECT CAST(COUNT(*) AS INTEGER)
          FROM likes
          WHERE likes."targetId" = "Comment".id
          AND likes."targetType" = ${LikeTargetType.COMMENT}
          AND likes."isDislike" = true
        )`),
        'dislikeCount',
      ],
    ];
  }

  private getUserLikeStatusAttribute(userId: string): [Literal, string] {
    return [
      this.commentsRepository.sequelize.literal(`(
        SELECT CASE 
          WHEN "isDislike" = true THEN 'dislike'
          WHEN "isDislike" = false THEN 'like'
          ELSE NULL
        END
        FROM likes
        WHERE likes."targetId" = "Comment".id 
        AND likes."targetType" = ${LikeTargetType.COMMENT}
        AND likes."userId" = '${userId}'
        LIMIT 1
      )`),
      'reaction',
    ];
  }

  private getCommentCountAttribute(): [Literal, string] {
    return [
      this.commentsRepository.sequelize.literal(`(
        SELECT CAST(COUNT(*) AS INTEGER) 
        FROM comments AS replies
        WHERE replies."parentId" = "Comment".id
      )`),
      'commentCount',
    ];
  }

  private getCommentAttributes(userId?: string): FindAttributeOptions {
    const attributes = {
      include: [
        ...this.getLikeCountAttributes(),
        this.getCommentCountAttribute(),
      ],
    };

    if (userId) {
      attributes.include.push(this.getUserLikeStatusAttribute(userId));
    }

    return attributes;
  }
}
