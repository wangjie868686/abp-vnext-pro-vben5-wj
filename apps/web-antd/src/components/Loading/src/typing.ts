export enum SizeEnum {
  DEFAULT = 'default',
  LARGE = 'large',
  SMALL = 'small',
}

export interface LoadingProps {
  tip: string;
  size: SizeEnum;
  absolute: boolean;
  loading: boolean;
  background: string;
  theme: 'dark' | 'light';
}
