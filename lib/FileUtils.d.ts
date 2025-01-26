import fs from 'node:fs';
export declare const FileUtils: {
    isExist(p: string): boolean;
    isFile(filePath: string): boolean;
    isDirectory(dirPath: string): boolean;
    mkdir(dir: string, mode?: string | number): boolean;
    chmod(p: fs.PathLike, mode: string | number): boolean;
    getdirFiles(dir: string, prefix?: string): any[];
    getCharCodeLength(charCode: number): 1 | 2 | 3 | 4;
    getPathNameLength(pathName: string): number;
    truncatePathName(fileName: string, maxLength?: number): string;
    rename(src: string, dest: string, existsPolicy: "replace" | "rename" | "raiseExecption" | "mergeReplace" | "mergeRename" | "mergeRaiseExecption", options?: {
        srcExists: boolean;
        destIsFile: boolean;
    }): void;
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
