import { SetupStep } from "./SetupStep";

export interface Lab {
  id: string;
  name: string;
  description: string;
  baseImage: string;
  estimatedTime: number;
  isActive: boolean;
  createdAt: string;
  setupSteps?: SetupStep[];
}