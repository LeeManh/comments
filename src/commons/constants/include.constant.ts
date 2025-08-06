// import { Includeable } from 'sequelize';
import { Tag } from 'src/models/tag.model';
import { User } from 'src/models/user.model';

const USER = {
  model: User,
  attributes: ['id', 'username', 'avatar', 'displayName'],
};

const TAG = {
  model: Tag,
  through: { attributes: [] },
};

export const INCLUDE_CONSTANTS = {
  USER,
  TAG,
};
