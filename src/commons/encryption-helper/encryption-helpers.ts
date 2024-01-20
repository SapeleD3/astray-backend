import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  DecryptJwtTokenPayload,
  DecryptJwtTokenResponse,
  GenerateJwtTokenPayload,
  passwordHelperPayload,
} from './types';

export const encryptPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = (payload: passwordHelperPayload): boolean => {
  const { password, hash = '' } = payload;
  return bcrypt.compareSync(password, hash);
};

export const generateJwtToken = (payload: GenerateJwtTokenPayload): string => {
  const { id, secret, algorithm } = payload;

  const token = jwt.sign({ id }, secret, {
    algorithm,
    expiresIn: '1hr',
  });

  return token;
};

export const decryptJwtToken = (
  payload: DecryptJwtTokenPayload,
): DecryptJwtTokenResponse => {
  const { token, secret } = payload;

  const decodedToken = jwt.verify(token, secret) as DecryptJwtTokenResponse;

  return decodedToken;
};
