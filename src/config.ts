/// <reference path="../typings/tsd.d.ts" />

import _ = require('lodash');

import Plugin = require('./plugin');
import Runner = require('./runner');
import Environment = require('./environments/environment');
import NodeJsEnvironment = require('./environments/node_js');

export interface ConfigObject {
  plugin: Plugin.Plugin;
  src: any; // string or string[]
  dest: string;
  cwd?: string;
  typingDirectory?: string;
  defaultLibFileName?: string;
  env?: Environment;
  noWrite?: boolean;
}

export class Config implements ConfigObject {
  public plugin: Plugin.Plugin;
  public src: string[];
  public dest: string;
  public cwd: string;
  public typingDirectory: string;
  public defaultLibFileName: string;
  public env: Environment;
  public noWrite: boolean;

  constructor(args: ConfigObject) {
    this.cwd = args.cwd || process.cwd();
    this.env = args.env || new NodeJsEnvironment(this.cwd, args.plugin.newLine, args.defaultLibFileName);
    this.defaultLibFileName = this.env.defaultLibFileName;

    this.src = typeof args.src === 'string' ? [args.src] : args.src;
    this.src = this.src.map(s => this.env.resolvePath(s));
    this.dest = this.env.resolvePath(args.dest);
    this.cwd = this.env.resolvePath(this.cwd);

    this.typingDirectory = args.typingDirectory || this.getTypingDirectory(this.src);
    this.typingDirectory = this.env.resolvePath(this.typingDirectory);

    this.plugin = args.plugin;
    this.noWrite = args.noWrite || false;
  }

  public getTypingDirectory(src: string[]): string {
    var dirnames = src.map(s => {
      var resolvedPath = this.env.resolvePath(s);
      return this.env.dirname(resolvedPath).replace('\\', '/');
    });
    if (!dirnames.every(d => _.contains(d, this.cwd))) { return this.cwd; }

    var minDirCount = _.min(dirnames.map(d => d.split('/').length));
    var minDirnames = dirnames.filter(d => d.split('/').length === minDirCount);
    return minDirnames.every(d => d === minDirnames[0]) ? minDirnames[0] : this.cwd;
  }
}
