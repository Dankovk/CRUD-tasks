declare module "class-variance-authority" {
  export type ClassValue = string | number | null | undefined | false | Record<string, boolean> | ClassValue[];
  // Minimal VariantProps helper so components can type cva variants
  export type VariantProps<T extends (...args: any[]) => any> = NonNullable<Parameters<T>[0]>;
  export function cva(base?: string, config?: any): (options?: Record<string, unknown>) => string;
}
