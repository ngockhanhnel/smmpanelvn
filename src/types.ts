/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Page = 'login' | 'register' | 'forgot-password';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface UserSession {
  username: string;
  email: string;
  isLoggedIn: boolean;
}
