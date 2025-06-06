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
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(EUserRole),
      default: EUserRole.User,
    },

    //* Full Name *\\
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

    //* Profile Complete *\\
    isProfileComplete: {
      type: Boolean,
      required: true,
      default: false,
    },

    //* Two Factor *\\
    isTwoFactorEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: undefined,
      select: false,
    },

    //* Confirm Email *\\
    isEmailConfirm: {
      type: Boolean,
      required: true,
      default: false,
    },
    emailConfirmToken: {
      type: String,
      default: undefined,
      select: false,
    },
    emailExpiresToken: {
      type: Date,
      default: undefined,
    },

    //* New Email *\\
    changeEmailToken: {
      type: String,
      default: undefined,
      select: false,
    },
    changeEmailNew: {
      type: String,
      default: undefined,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => email === undefined || isEmail(email),
        message: EMAIL_VALIDATION_ERROR,
      },
    },
    changeEmailExpires: {
      type: Date,
      default: undefined,
    },

    //* New Password *\\
    changePasswordNew: {
      type: String,
      default: undefined,
      select: false,
    },
    changePasswordExpires: {
      type: Date,
      default: undefined,
    },
    changePasswordToken: {
      type: String,
      default: undefined,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      default: undefined,
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
        ret.changePasswordNew = undefined;
        ret.changePasswordToken = undefined;

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
        ret.changePasswordNew = undefined;
        ret.changePasswordToken = undefined;

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
