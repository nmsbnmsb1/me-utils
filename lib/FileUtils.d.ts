import fs from 'node:fs';
export declare const FileUtils: {
    isExist(dir: string): boolean;
    isFile(filePath: string): boolean;
    isDirectory(filePath: string): boolean;
    chmod(p: fs.PathLike, mode: string | number): boolean;
    mkdir(dir: string, mode?: string | number): boolean;
    getdirFiles(dir: string, prefix?: string): any[];
    rmdir(p: string, reserve?: any): Promise<unknown>;
    rm(p: string, reserve?: any): Promise<unknown>;
    writeFile(p: string, data: any, options?: fs.WriteFileOptions): void;
    writeJSONFile(p: string, data: any, jsonSpace?: number, options?: fs.WriteFileOptions): void;
    readFile(p: string, options?: {
        encoding?: null;
        flag?: string;
    }): Buffer<ArrayBufferLike>;
    readTxtFile(p: string, options?: {
        encoding?: null;
        flag?: string;
    }): string;
    readJSONFile(p: string, options?: {
        encoding?: null;
        flag?: string;
    }): any;
};
