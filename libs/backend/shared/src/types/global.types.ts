import { Type, DynamicModule, ForwardReference } from '@nestjs/common';

export type IEntryNestModule<T> =
  | Type<T>
  | DynamicModule
  | ForwardReference
  | Promise<Type<T> | DynamicModule | ForwardReference>;
