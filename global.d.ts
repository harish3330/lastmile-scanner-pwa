declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL?: string
    NEXT_PUBLIC_API_BASE_URL?: string
    NODE_ENV?: 'development' | 'production' | 'test'
    NEXT_PRIVATE_RESPONSE_CACHE_TTL?: string
    NEXT_PRIVATE_RESPONSE_CACHE_MAX_SIZE?: string
    NEXT_OTEL_PERFORMANCE_PREFIX?: string
    NEXT_OTEL_VERBOSE?: string
    [key: string]: string | undefined
  }
}

declare var process: {
  env: NodeJS.ProcessEnv
}
