import { Schema } from 'mongoose';
import { isEmail } from 'validator';

import { EMAIL_VALIDATION_ERROR } from './constant/user-validation.constants';
import { loginToLowerCase } from './lib/hooks/loginToLowerCase';

import { IUser, EUserRole } from '@shared';

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
      lowercase: true,
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
    isTwoFactorEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    isEmailConfirm: {
      type: Boolean,
      required: true,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    emailConfirmToken: {
      type: String || undefined,
      select: false,
    },
    emailExpiresToken: {
      type: Date || undefined,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

UserSchema.pre('find', loginToLowerCase);
UserSchema.pre('findOne', loginToLowerCase);
UserSchema.pre('findOneAndDelete', loginToLowerCase);
UserSchema.pre('findOneAndReplace', loginToLowerCase);
UserSchema.pre('findOneAndUpdate', loginToLowerCase);

UserSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.secondName}`;
});

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.twoFactorSecret = undefined;
    ret.emailConfirmToken = undefined;
    return ret;
  },
});
