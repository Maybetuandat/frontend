export interface SetupStep {
  id: string;
  stepOrder: number;
  title: string;
  description: string;
  command: string;
  expectedOutput?: string;
  labId: string;
}