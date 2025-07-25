export interface CreateLabRequest {
  name: string;
  description: string;
  baseImage: string;
  estimatedTime: number;
}