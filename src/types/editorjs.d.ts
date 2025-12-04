// Type declarations for @editorjs/editorjs
declare module '@editorjs/editorjs' {
  export interface OutputData {
    time?: number;
    blocks: Array<{
      id?: string;
      type: string;
      data: any;
    }>;
    version?: string;
  }

  export interface EditorConfig {
    holder?: string | HTMLElement;
    placeholder?: string;
    logLevel?: 'VERBOSE' | 'INFO' | 'WARN' | 'ERROR';
    data?: OutputData;
    onReady?: () => void;
    onChange?: (api: any, event: any) => void;
    autofocus?: boolean;
    tools?: Record<string, any>;
    readOnly?: boolean;
    minHeight?: number;
    inlineToolbar?: boolean | string[];
    i18n?: any;
  }

  export default class EditorJS {
    constructor(config?: EditorConfig);
    isReady: Promise<void>;
    save(): Promise<OutputData>;
    destroy(): void;
    clear(): void;
    render(data: OutputData): Promise<void>;
  }
}

declare module '@editorjs/paragraph';
declare module '@editorjs/header';
declare module '@editorjs/list';
declare module '@editorjs/code';
declare module '@editorjs/inline-code';
declare module '@editorjs/underline';
declare module '@editorjs/marker';

// Audio file type declarations
declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}
