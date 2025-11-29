import { APIDetailCreateResponse } from "./response";

export type FileType = "file" | "photo" | "video" | "audio";

export interface CreateFileRequest {
  file: File;
  filetype: FileType;
}

export interface FileData {
  file: string; // URI
  uuid: string;
  filesize?: number | null;
  filetype: FileType;
}

export interface CreateFileResponse extends APIDetailCreateResponse<FileData> {}

export interface ListFileResponse extends APIDetailCreateResponse<FileData> {}
