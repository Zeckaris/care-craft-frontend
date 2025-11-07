// src/types/router.d.ts
import 'react-router-dom';

declare module 'react-router-dom' {
  export interface Handle {
    crumb?: ((data?: any) => string) | string;
  }

  export interface UIMatch {
    handle?: Handle;
  }
}