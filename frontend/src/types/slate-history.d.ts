declare module 'slate-history' {
  import { Editor } from 'slate';

  export function withHistory<T extends Editor>(editor: T): T;
} 