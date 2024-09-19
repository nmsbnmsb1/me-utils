export declare class DomUtils {
    static trim(str: string): string;
    static camelCase(name: string): string;
    static on(el: any, event: any, handler: any): void;
    static off(el: any, event: any, handler: any): void;
    static once(el: any, event: any, fn: any, ...args: any[]): void;
    static hasClass(el: any, cls: any): any;
    static addClass(el: any, cls: any): void;
    static removeClass(el: any, cls: any): void;
    static getStyle(el: any, styleName: any, options?: {
        window: any;
    }): any;
    static setStyle(el: any, styleName: any, value: any): void;
    static isScroll(el: any, vertical: any): any;
    static getScrollContainer(el: any, vertical: any, options?: {
        window: any;
    }): any;
    static isInContainer(el: any, container: any, options?: {
        window: any;
    }): boolean;
    private static scrollBarWidth;
    static calcNativeScrollBarWidth(options?: {
        window: any;
    }): number;
}
