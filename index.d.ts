import * as passport from 'passport';
import { AuthUser } from './src/types/auth';

declare global {
    namespace Express {
        export interface User extends AuthUser {}
    }
}