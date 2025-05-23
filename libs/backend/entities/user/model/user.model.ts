import { Schema } from 'mongoose';
import { isEmail } from 'validator';

import { EMAIL_VALIDATION_ERROR } from './constant';
import { loginToLowerCase } from './lib';

import { IUser, EUserRole } from '@shared';

export const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
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
      index: true,
    },
    passwordHash: {
      //TODO - добавить хотя бы минимальную проверку на валидность пароля
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
      type: String || null,
      default: null,
    },
    emailConfirmToken: {
      type: String || null,
      select: false,
    },
    emailExpiresToken: {
      type: Date || null,
    },
    changeEmailToken: {
      type: String || null,
      select: false,
    },
    changeEmailNew: {
      type: String || null,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => email === null || isEmail(email),
        message: EMAIL_VALIDATION_ERROR,
      },
    },
    changeEmailExpires: {
      type: Date || null,
    },
    changePasswordNew: {
      //TODO - добавить хотя бы минимальную проверку на валидность пароля, как в 'passwordHash'
      type: String || null,
      select: false,
    },
    changePasswordExpires: {
      type: Date || null,
    },
    changePasswordToken: {
      type: String || null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.passwordHash = undefined;
        ret.twoFactorSecret = undefined;
        ret.emailConfirmToken = undefined;
        ret.changeEmailToken = undefined;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.passwordHash = undefined;
        ret.twoFactorSecret = undefined;
        ret.emailConfirmToken = undefined;
        ret.changeEmailToken = undefined;
        return ret;
      },
    },
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
