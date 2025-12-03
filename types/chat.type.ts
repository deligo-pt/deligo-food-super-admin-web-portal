export type TMessage = {
  id: string;
  from: string;
  to: string;
  text?: string;
  images?: string[];
  audio?: string | null;
  at: string;
  status?: string;
};
