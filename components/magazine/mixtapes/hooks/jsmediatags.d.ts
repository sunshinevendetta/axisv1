declare module "jsmediatags" {
  interface TagType {
    tags: {
      title?: string;
      artist?: string;
      album?: string;
      picture?: {
        format: string;
        data: number[];
      };
      [key: string]: unknown;
    };
  }
  function read(
    url: string,
    callbacks: {
      onSuccess: (tag: TagType) => void;
      onError: (error: unknown) => void;
    },
  ): void;
  export default { read };
}
