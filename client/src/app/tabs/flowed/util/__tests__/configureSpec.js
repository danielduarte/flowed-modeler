/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import configureModeler from '../configure';


describe('tabs/flowed/util - configure', function() {

  describe('configureModeler', function() {

    describe('should recognize plug-in points', function() {

      it('flowed.modeler.additionalModules', function() {

        // given
        var module1 = { __id: 1 };
        var module2 = { __id: 2 };
        var existingModule = { __id: 'EXISTING' };

        var getPlugins = setupPlugins([
          [ 'flowed.modeler.additionalModules', module1 ],
          [ 'flowed.modeler.additionalModules', module2 ]
        ]);

        // when
        var {
          options,
          warnings
        } = configureModeler(getPlugins, {
          additionalModules: [
            existingModule
          ]
        });

        // then
        expect(options).to.eql({
          additionalModules: [
            existingModule,
            module1,
            module2
          ]
        });

        expect(warnings).to.be.empty;
      });


      it('flowed.modeler.moddleExtension', function() {

        // given
        var fooExtension = { name: 'foo' };
        var barExtension = { name: 'bar' };

        var existingExtension = { name: 'existing' };

        var getPlugins = setupPlugins([
          [ 'flowed.modeler.moddleExtension', fooExtension ],
          [ 'flowed.modeler.moddleExtension', barExtension ]
        ]);

        // when
        var {
          options,
          warnings
        } = configureModeler(getPlugins, {
          moddleExtensions: {
            existing: existingExtension
          }
        });

        // then
        expect(options).to.eql({
          moddleExtensions: {
            existing: existingExtension,
            foo: fooExtension,
            bar: barExtension
          }
        });

        expect(warnings).to.be.empty;
      });


      it('flowed.modeler.configure', function() {

        // given
        function configureLinting(config) {

          expect(config).to.eql({ a: 'B' });

          return {
            ...config,
            linting: { foo: 'BAR' }
          };
        }

        var getPlugins = setupPlugins([
          [ 'flowed.modeler.configure', configureLinting ]
        ]);

        // when
        var {
          options,
          warnings
        } = configureModeler(getPlugins, {
          a: 'B'
        });

        // then
        expect(options).to.eql({
          a: 'B',
          linting: { foo: 'BAR' }
        });

        expect(warnings).to.be.empty;
      });

    });


    describe('should collect warnings', function() {

      it('flowed.modeler.moddleExtension', function() {

        // given
        var noNameExtension = { };
        var existingExtension = { name: 'existing' };
        var existingOverrideExtension = { name: 'existing' };

        var getPlugins = setupPlugins([
          [ 'flowed.modeler.moddleExtension', noNameExtension ],
          [ 'flowed.modeler.moddleExtension', existingOverrideExtension ]
        ]);

        // when
        var {
          options,
          warnings
        } = configureModeler(getPlugins, {
          moddleExtensions: {
            existing: existingExtension
          }
        });

        // then
        expect(options).to.eql({
          moddleExtensions: {
            existing: existingExtension
          }
        });

        expect(warnings).to.have.length(2);

        expect(warnings[0].message).to.eql(
          'flowed.modeler.moddleExtension is missing <name> property'
        );

        expect(warnings[1].message).to.eql(
          'flowed.modeler.moddleExtension overrides moddle extension with name <existing>'
        );
      });


      it('flowed.modeler.configure', function() {

        // given
        function configureNoResult() {}

        var getPlugins = setupPlugins([
          [ 'flowed.modeler.configure', configureNoResult ]
        ]);

        // when
        var {
          options,
          warnings
        } = configureModeler(getPlugins);

        // then
        expect(options).to.eql({});

        expect(warnings).to.have.length(1);

        expect(warnings[0].message).to.eql(
          'flowed.modeler.configure does not return options'
        );

      });

    });

  });

});


// helpers /////////////////////

function setupPlugins(plugins) {
  return function(type) {
    return plugins.filter(p => p[0] === type).map(p => p[1]);
  };
}
