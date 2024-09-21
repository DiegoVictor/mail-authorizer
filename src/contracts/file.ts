export enum IFileType {
  VIDEO = 'VIDEO',
}

export interface IFile {
  id: string;
  type: IFileType;
  title: string;
  key: string;
  createdAt: number;
}
