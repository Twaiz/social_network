import { Schema } from 'mongoose';
import { isEmail } from 'validator';
import { EMAIL_VALIDATION_ERROR } from './auth.constants';

enum EUserRole {
  User = 'User',
  Admin = 'Admin',
}

interface IUser {
  email: string;
  login: string;
  passwordHash: string;
  role: EUserRole;
  firstName: string;
  secondName: string;
  isProfileComplete: boolean;
}

export const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => isEmail(email),
        message: EMAIL_VALIDATION_ERROR,
      },
    },
    login: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 16,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(EUserRole),
      default: EUserRole.User,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    secondName: {
      type: String,
      required: true,
      trim: true,
    },
    isProfileComplete: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

UserSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.secondName}`;
});
