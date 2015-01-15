import helper = require('../test_helper');

import tss = require('typescript-services-api');

import TypeScriptParser = require('../../src/typescript_parser');
import Symbol = require('../../src/symbol');

describe('TypeScriptParser', () => {
  var instance: TypeScriptParser;

  var definitionPath = 'test/fixtures/typings/definitions.d.ts';
  var colorPath = 'test/fixtures/typings/color/color.d.ts';

  var runner = helper.createRunner();

  beforeEach(() => {
    instance = new TypeScriptParser([definitionPath], runner);
  });

  describe('#sourceFiles', () => {
    beforeEach(() => {
      instance.parse();
    });

    it('should return loaded instances of ts.SourceFile', () => {
      var expected = [colorPath, definitionPath];
      assert.deepEqual(instance.sourceFiles.map(d => d.filename), expected);
    });
  });

  describe('#parse', () => {
    context('when non external modules are given', () => {
      beforeEach(() => {
        instance.parse();
      });

      it('should parse types', () => {
        var expected = [
          // Array
          'Line[]',
          // Tuple
          'NumberAndNumberTuple',
          // Function
          'Rpc.Get.getRange', 'Rpc.Post.setOptions', 'Type.ColoredSquareSetColorCallbackFunction',
          'Type.LineSetColorCallbackFunction', 'emitLog',
          // ObjectType
          'Rpc.Get.GetRangeObject', 'Rpc.Post.SetOptionsOptionsObject',
          // Enum
          'Type.Color',
          // Interface
          'Type.ColoredSquare', 'Type.Point', 'Type.Range', 'Type.RangeWithNumber',
          'Type.Square', 'Type.SquareDictionary', 'Type.Transformer',
          // Class
          'Type.Line', 'Type.LineDrawer',
          // TypeParameter
          'Type.T', 'Type.T',
          // PrimitiveType
          'boolean', 'integer', 'number', 'string', 'void', 'any'
        ].sort().join('\n');
        assert(instance.types.map(t => t.fullName).join('\n') === expected);
      });

      it('should parse modules', () => {
        var expected = ['Global', 'Rpc.Get', 'Rpc.Post', 'Rpc', 'Type'].sort().join('\n');
        assert(instance.modules.map(t => t.fullName).join('\n') === expected);
      });
    });

    context('when external modules are given', () => {
      var definitionPath = 'test/fixtures/typings/externals/foo.d.ts';

      beforeEach(() => {
        instance = new TypeScriptParser([definitionPath], runner);
        instance.parse();
      });

      it('should parse types', () => {
        var expected = ['externals/foo.A.Foo', 'externals/bar.Bar'].sort().join('\n');
        assert(instance.types.map(t => t.fullName).join('\n') === expected);
      });

      it('should parse modules', () => {
        var expected = ['Global', 'externals/foo', 'externals/foo.A', 'externals/bar'].sort().join('\n');
        assert(instance.modules.map(t => t.fullName).join('\n') === expected);
      });
    });
  });

  describe('#validate', () => {
    beforeEach(() => {
      instance.parse();
    });

    afterEach(() => {
      runner.plugin.disallow = {};
    });

    context('in general', () => {
      it('should not throw an error', () => {
        assert.doesNotThrow(() => instance.validate());
      });
    });

    context('when dissalow#any is true', () => {
      beforeEach(() => {
        runner.plugin.disallow.any = true;
      });
      it('should throw an error', () => {
        assert.throws(() => instance.validate(), /any type/);
      });
    });

    context('when dissalow#tuple is true', () => {
      beforeEach(() => {
        runner.plugin.disallow.tuple = true;
      });
      it('should throw an error', () => {
        assert.throws(() => instance.validate(), /tuple type/);
      });
    });

    context('when dissalow#generics is true', () => {
      beforeEach(() => {
        runner.plugin.disallow.generics = true;
      });
      it('should throw an error', () => {
        assert.throws(() => instance.validate(), /generics/);
      });
    });

    context('when dissalow#overload is true', () => {
      beforeEach(() => {
        runner.plugin.disallow.overload = true;
      });
      it('should throw an error', () => {
        assert.throws(() => instance.validate(), /overload/);
      });
    });
  });
});
