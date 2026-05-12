declare module "jsmediatags" {
  export type JSMediaTagPicture = {
    format: string;
    data: ArrayLike<number>;
  };

  export type JSMediaTagFrame = {
    id: string;
    size: number;
    description: string;
    data: string;
  };

  export type JSMediaTagValue = string | JSMediaTagFrame | JSMediaTagPicture;

  export type JSMediaTags = {
    title?: string;
    artist?: string;
    album?: string;
    picture?: JSMediaTagPicture;
    [key: string]: JSMediaTagValue | undefined;
  };

  export type JSMediaTagsError = {
    type: "xhr" | "fileReader" | "tagFormat";
    info?: string;
    xhr?: XMLHttpRequest;
  };

  export type JSMediaTagResult = {
    tags: JSMediaTags;
  };

  export type JSMediaTagsLocation = string | Blob | File | ArrayBuffer;

  export type JSMediaTagsCallbacks = {
    onSuccess: (tag: JSMediaTagResult) => void;
    onError?: (error: JSMediaTagsError) => void;
  };

  export interface JSMediaTagsApi {
    read(location: JSMediaTagsLocation, callbacks: JSMediaTagsCallbacks): void;
  }

  const jsmediatags: JSMediaTagsApi;
  export default jsmediatags;
}
