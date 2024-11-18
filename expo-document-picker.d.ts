// expo-document-picker.d.ts
declare module 'expo-document-picker' {
    export function launchDocumentPickerAsync(options: { type: string[] }): Promise<{
      type: string;
      uri: string;
      name: string;
      size: number;
      mimeType: string;
    }>;
  export type DocumentPickerResult =
    | DocumentPickerSuccessResult
    | DocumentPickerErrorResult;

  export interface DocumentPickerSuccessResult {
    type: 'success';
    name: string;
    uri: string;
    size: number;
    mimeType: string;
    // other properties...
  }

  export interface DocumentPickerErrorResult {
    type: 'cancel' | 'error';
    message?: string;
  }
}
