/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Body_create_camera_api_api_cameras_post */
export interface BodyCreateCameraApiApiCamerasPost {
  /**
   * Model Name
   * Название модели камеры
   */
  model_name: string;
  /**
   * Image File
   * Файл изображения камеры
   */
  image_file?: File | null;
  /**
   * Video File
   * Файл короткого видео камеры
   */
  video_file?: File | null;
}

/** CameraPublishRequest */
export interface CameraPublishRequest {
  /** Model Name */
  model_name?: string | null;
  /** Description */
  description?: string | null;
  /**
   * Power
   * Потребляемая мощность в Вт
   */
  power?: number | null;
  /**
   * Resolution
   * Разрешение камеры
   */
  resolution?: string | null;
}

/** CameraResponse */
export interface CameraResponse {
  /** Id */
  id: number;
  /** Model Name */
  model_name: string;
  /** Description */
  description?: string | null;
  /** Status */
  status: string;
  /** Image Url */
  image_url?: string | null;
  /** Video Url */
  video_url?: string | null;
  /** Power */
  power?: number | null;
  /** Resolution */
  resolution?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Published At */
  published_at?: string | null;
  /** Creator Id */
  creator_id: number;
  /**
   * Likes Count
   * @default 0
   */
  likes_count?: number;
  /**
   * Is Creator
   * @default 0
   */
  is_creator?: number;
  /**
   * Is Liked
   * @default 0
   */
  is_liked?: number;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** LikeToggleRequest */
export interface LikeToggleRequest {
  /**
   * Like
   * 0 - отменить лайк, 1 - поставить лайк
   * @min 0
   * @max 1
   */
  like: number;
}

/** UserLoginRequest */
export interface UserLoginRequest {
  /**
   * Username
   * @minLength 1
   */
  username: string;
  /**
   * Password
   * @minLength 1
   */
  password: string;
}

/** UserLoginResponse */
export interface UserLoginResponse {
  /** Session Id */
  session_id: string;
  /** Token */
  token: string;
  /** User Id */
  user_id: number;
}

/** UserRegisterRequest */
export interface UserRegisterRequest {
  /**
   * Username
   * @minLength 1
   * @maxLength 50
   */
  username: string;
  /**
   * Password
   * @minLength 1
   * @maxLength 100
   */
  password: string;
}

/** UserResponse */
export interface UserResponse {
  /** Id */
  id: number;
  /** Username */
  username: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Сервис расчета энергопотребления систем видеонаблюдения
 * @version 1.0.0
 *
 * REST API для управления моделями камер (ЛР3-ЛР4) и веб-интерфейс (ЛР1-ЛР2)
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags cameras
     * @name GetCamerasApiApiCamerasGet
     * @summary Get Cameras Api
     * @request GET:/api/cameras
     */
    getCamerasApiApiCamerasGet: (
      query?: {
        /**
         * Power Max
         * Фильтрация по максимальной мощности
         */
        power_max?: number | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<CameraResponse[], HTTPValidationError>({
        path: `/api/cameras`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags cameras
     * @name CreateCameraApiApiCamerasPost
     * @summary Create Camera Api
     * @request POST:/api/cameras
     */
    createCameraApiApiCamerasPost: (
      data: BodyCreateCameraApiApiCamerasPost,
      params: RequestParams = {},
    ) =>
      this.request<CameraResponse, HTTPValidationError>({
        path: `/api/cameras`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags cameras
     * @name GetCameraFeedApiApiCamerasFeedGet
     * @summary Get Camera Feed Api
     * @request GET:/api/cameras/feed
     */
    getCameraFeedApiApiCamerasFeedGet: (
      query?: {
        /**
         * Camera Id
         * ID текущей камеры
         */
        camera_id?: number | null;
        /**
         * Next
         * Флаг перехода к следующей камере
         * @default false
         */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<CameraResponse, HTTPValidationError>({
        path: `/api/cameras/feed`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags cameras
     * @name GetCameraDraftApiApiCamerasDraftGet
     * @summary Get Camera Draft Api
     * @request GET:/api/cameras/draft
     */
    getCameraDraftApiApiCamerasDraftGet: (params: RequestParams = {}) =>
      this.request<CameraResponse, any>({
        path: `/api/cameras/draft`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags cameras
     * @name PublishCameraApiApiCamerasCameraIdPublishPut
     * @summary Publish Camera Api
     * @request PUT:/api/cameras/{camera_id}/publish
     */
    publishCameraApiApiCamerasCameraIdPublishPut: (
      cameraId: number,
      data: CameraPublishRequest | null,
      params: RequestParams = {},
    ) =>
      this.request<CameraResponse, HTTPValidationError>({
        path: `/api/cameras/${cameraId}/publish`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags cameras
     * @name DeleteCameraApiApiCamerasCameraIdDelete
     * @summary Delete Camera Api
     * @request DELETE:/api/cameras/{camera_id}
     */
    deleteCameraApiApiCamerasCameraIdDelete: (
      cameraId: number,
      params: RequestParams = {},
    ) =>
      this.request<CameraResponse, HTTPValidationError>({
        path: `/api/cameras/${cameraId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags cameras
     * @name ToggleCameraLikeApiApiCamerasCameraIdLikePost
     * @summary Toggle Camera Like Api
     * @request POST:/api/cameras/{camera_id}/like
     */
    toggleCameraLikeApiApiCamerasCameraIdLikePost: (
      cameraId: number,
      data: LikeToggleRequest,
      params: RequestParams = {},
    ) =>
      this.request<CameraResponse, HTTPValidationError>({
        path: `/api/cameras/${cameraId}/like`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name RegisterUserApiApiUsersRegisterPost
     * @summary Register User Api
     * @request POST:/api/users/register
     */
    registerUserApiApiUsersRegisterPost: (
      data: UserRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<UserResponse, HTTPValidationError>({
        path: `/api/users/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name LoginUserApiApiUsersLoginPost
     * @summary Login User Api
     * @request POST:/api/users/login
     */
    loginUserApiApiUsersLoginPost: (
      data: UserLoginRequest,
      params: RequestParams = {},
    ) =>
      this.request<UserLoginResponse, HTTPValidationError>({
        path: `/api/users/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name LogoutUserApiApiUsersLogoutPost
     * @summary Logout User Api
     * @request POST:/api/users/logout
     */
    logoutUserApiApiUsersLogoutPost: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/users/logout`,
        method: "POST",
        format: "json",
        ...params,
      }),
  };
}
