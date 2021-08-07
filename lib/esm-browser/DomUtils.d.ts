export declare class DomUtils {
    static trim(str: string): string;
    static camelCase(name: string): string;
    static on(el: any, event: any, handler: any): void;
    static off(el: any, event: any, handler: any): void;
    static once(el: any, event: any, fn: any, ...args: any[]): void;
    static hasClass(el: any, cls: any): any;
    static addClass(el: any, cls: any): void;
    static removeClass(el: any, cls: any): void;
    static getStyle(element: any, styleName: any): any;
    static setStyle(element: any, styleName: any, value: any): void;
    static isScroll(el: any, vertical: any): any;
    static getScrollContainer(el: any, vertical: any): any;
    static isInContainer(el: any, container: any): boolean;
    private static scrollBarWidth;
    static calcNativeScrollBarWidth(): number;
}
