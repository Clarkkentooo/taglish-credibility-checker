declare module '@standard-schema/spec' {
  export type StandardSchemaV1<Input = any, Output = any> = {
    '~standard': {
      validate: (
        values: Input,
      ) =>
        | { issues?: StandardSchemaV1.Issue[]; value?: Output }
        | Promise<{ issues?: StandardSchemaV1.Issue[]; value?: Output }>;
    };
  };

  export namespace StandardSchemaV1 {
    export type Issue = {
      message: string;
      path?: Array<string | number>;
    };
  }
}

declare module '@standard-schema/utils' {
  export function getDotPath(issue: any): string | undefined;
}
