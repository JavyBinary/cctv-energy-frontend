import axios from 'axios';
import { Api } from './Api';

/**
 * Типизированный API-клиент, сгенерированный из Swagger/OpenAPI.
 * Все запросы идут на относительный путь через Vite proxy (/api, /media) с кукой сессии.
 */
export const api = new Api({
  baseURL: '/',
  withCredentials: true,
  timeout: 5000,
});

/**
 * Прямой инстанс Axios для запросов авторизации/деавторизации
 * (без кодогенерации и без Redux Thunk по требованиям ЛР6).
 */
export const authAxios = axios.create({
  baseURL: '/',
  withCredentials: true,
  timeout: 5000,
});
