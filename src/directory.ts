import globby from 'globby';
import fs from 'fs-extra';
import path from 'path';
// @ts-ignore
import slash from 'slash2';

import { LineInfo, LocFile } from './file';

const defaultInfo: LineInfo = {
  total: 0,
  code: 0,
  comment: 0,
};

/**
 * Collect info of a directory.
 *
 * @export
 * @class LocDir
 */
export class LocDir {
  private pattern: string;

  /**
   * Creates an instance of LocDir.
   * @param {string} pattern
   * @memberof LocDir
   */
  constructor(pattern: string) {
    this.pattern = pattern;
  }

  /**
   * load directory info.
   *
   * @private
   * @returns {{
   *     files: LangFile[],
   *     info: LineInfo,
   *     languages: {
   *       [key: string]: number;
   *     }
   *   }}
   * @memberof LocDir
   */
  async loadInfo(): Promise<{
    files: string[];
    info: LineInfo;
    languages: {
      [key: string]: LineInfo & {
        sum: number;
      };
    };
  }> {
    const paths = globby.sync('**', {
      cwd: this.pattern,
      ignore: [
        '**/*.map',
        '**/yarn**',
        '**/.github',
        '**/node_modules/**',
        '**/dist/**',
        '**/*.snap',
      ],
    });
    const files: string[] = [];
    const info: LineInfo = { ...defaultInfo };
    let languages: {
      [key: string]: LineInfo & {
        sum: number;
      };
    } = {};

    await Promise.all(paths.map(async (pathItem) => {
      const fullPath = slash(path.join(this.pattern, pathItem));
      if (
        !pathItem ||
        !(await fs.pathExists(fullPath)) ||
        (await fs.stat(fullPath)).isDirectory()
      ) {
        return;
      }
      const file = new LocFile(fullPath);
      const fileLineInfo = await file.getFileInfo();
      const { lines } = fileLineInfo;
      info.total += lines.total;
      info.code += lines.code;
      info.comment += lines.comment;
      const language = { ...languages[fileLineInfo.languages] };
      language.code = lines.code + (language.code || 0);
      language.sum = (language.sum || 0) + 1;
      language.comment = lines.comment + (language.comment || 0);
      language.total = lines.total + (language.total || 0);
      languages = {
        ...languages,
        [fileLineInfo.languages]: language,
      };
      files.push(fullPath);
    }));

    return {
      files,
      info,
      languages,
    };
  }

  /**
   * Return detect pattern of the directory.
   *
   * @returns {string}
   * @memberof LocDir
   */
  public getPattern(): string {
    return this.pattern;
  }
}
