import { CameraResponse } from '../api/Api';
import { CameraModel, CameraStatus } from './types';

export function mapApiCamera(c: CameraResponse): CameraModel {
  return {
    id: c.id,
    model_name: c.model_name,
    description: c.description ?? '',
    power: c.power ?? 0,
    resolution: c.resolution ?? 'Full HD',
    is_outdoor: false,
    status: (c.status as CameraStatus) || 'published',
    image_url: c.image_url ?? '',
    video_url: c.video_url ?? '',
    likes_count: c.likes_count ?? 0,
    creator_id: c.creator_id,
    is_creator: c.is_creator ?? 0,
    is_liked: c.is_liked ?? 0,
  };
}
