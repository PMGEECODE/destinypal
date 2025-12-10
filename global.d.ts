// global.d.ts
interface Window {
  turnstile?: {
    render: (selector: string, options: any) => void;
    reset: (widgetId: string) => void;
    getResponse: (widgetId: string) => string;
  };
}
