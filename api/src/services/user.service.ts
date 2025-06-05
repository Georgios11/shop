import { NotFoundError } from '../errors/apiError';
import User, { UserDocument } from '../models/User';

const create = async (user: UserDocument): Promise<UserDocument> => {
  return user.save();
};

const findById = async (userId: string): Promise<UserDocument> => {
  const foundMovie = await User.findById(userId);

  if (!foundMovie) {
    throw new NotFoundError(`User ${userId} not found`);
  }

  return foundMovie;
};

const findAll = async (): Promise<UserDocument[]> => {
  return User.find();
};

const update = async (
  userId: string,
  update: Partial<UserDocument>
): Promise<UserDocument | null> => {
  const foundMovie = await User.findByIdAndUpdate(userId, update, {
    new: true,
  });

  if (!foundMovie) {
    throw new NotFoundError(`Movie ${userId} not found`);
  }

  return foundMovie;
};

const deleteMovie = async (userId: string): Promise<UserDocument | null> => {
  const foundMovie = User.findByIdAndDelete(userId);

  if (!foundMovie) {
    throw new NotFoundError(`Movie ${userId} not found`);
  }

  return foundMovie;
};

export default {
  create,
  findById,
  findAll,
  update,
  deleteMovie,
};
