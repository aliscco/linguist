import * as path from 'path';
import slash from 'slash2';

import loc from '../src';
import { Languages } from '../src/languages';

describe('Languages', () => {
  describe('.getExtensionMap', () => {
    it('should return equals', () => {
      const map = new Languages().getExtensionMap();
      expect(map['.js']).toEqual('javascript');
      expect(map['.jsx']).toEqual('javascript');
      expect(map['.ts']).toEqual('typescript');
      expect(map['.tsx']).toEqual('typescript');
      expect(map['.cpp']).toEqual('c++');
      expect(map['.md']).toEqual('markdown');
      expect(map['.json']).toEqual('json');
      expect(map['.yml']).toEqual('yaml');
      expect(map['.svg']).toEqual('svg');
    });
  });
});

describe('LocFile', () => {
  it('js info', async () => {
    const jsPath = slash(path.join(__dirname, '/data/index.js'));
    const file = await loc(jsPath);
    expect(file.files[0]).toEqual(jsPath);
    const { info, languages } = file;
    expect(Object.keys(languages).pop()).toEqual('javascript');
    expect(info).toEqual({
      total: 83,
      code: 70,
      comment: 5
    });
  });

  it('ts info', async () => {
    const tsPath = slash(path.join(__dirname, '/data/index.ts'));
    const file = await loc(tsPath);
    const { info, languages } = file;
    expect(Object.keys(languages).pop()).toEqual('typescript');
    expect(info).toEqual({
      total: 169,
      code: 100,
      comment: 46
    });
  });

  it('data dir info', async () => {
    const tsPath = slash(path.join(__dirname, './data'));
    const file = await loc(tsPath);
    const { info, languages } = file;
    expect(Object.keys(languages).sort().join()).toEqual('javascript,markdown,typescript');
    expect(info).toMatchSnapshot();
    expect(languages).toMatchSnapshot();
  });

  it('example dir info', async () => {
    const tsPath = slash(path.join(__dirname, '../example'));
    const file = await loc(tsPath);
    const { info, languages } = file;
    expect(Object.keys(languages).sort().join()).toEqual(
      ',ejs,javascript,json,less,markdown,svg,typescript',
    );
    expect(info).toMatchSnapshot();
    expect(languages).toMatchSnapshot();
  });
});
