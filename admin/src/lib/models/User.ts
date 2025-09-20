import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  role: 'customer' | 'seller';
  district?: string;
  province?: string;
  phone?: string;
}
