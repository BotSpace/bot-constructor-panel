export type FileType = "file" | "photo" | "video" | "audio";

export interface CreateFileRequest {
  file: File;
  filetype: FileType;
}

// Raw response from POST /api/v1/file (Go backend — no envelope).
export interface FileData {
  id: string;
  uuid: string;
  project_id?: string;
  name?: string;
  url: string;
  size?: number;
  filetype: FileType;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateFileResponse = FileData;
