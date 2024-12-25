export declare const DomUtils: {
    trim(str: string): string;
    camelCase(name: string): string;
    on(el: any, event: any, handler: any): void;
    off(el: any, event: any, handler: any): void;
    once(el: any, event: any, fn: any, ...args: any[]): void;
    hasClass(el: any, cls: any): any;
    addClass(el: any, cls: any): void;
    removeClass(el: any, cls: any): void;
    getStyle(el: any, styleName: any, options?: {
        window: any;
    }): any;
    setStyle(el: any, styleName: any, value: any): void;
    isScroll(el: any, vertical: any): any;
    getScrollContainer(el: any, vertical: any, options?: {
        window: any;
    }): any;
    isInContainer(el: any, container: any, options?: {
        window: any;
    }): boolean;
    calcNativeScrollBarWidth(options?: {
        window: any;
    }): number;
};
