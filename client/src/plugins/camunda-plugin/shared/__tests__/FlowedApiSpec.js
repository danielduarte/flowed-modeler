/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

/* global sinon */

import FlowedApi from '../FlowedApi';


describe('<FlowedApi>', () => {

  /**
   * @type {sinon.SinonStub<fetch>}
   */
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
  });


  describe('#deployDiagram', () => {

    const diagram = {
      name: 'diagram',
      contents: '<?xml version="1.0"?><bpmn:definitions><bpmn:process></bpmn:process></bpmn:definitions>'
    };


    it('should deploy diagram', async () => {

      // given
      const api = createFlowedApi({
        url: 'http://foo'
      });

      // when
      fetchSpy.resolves(new Response());

      const result = await api.deployDiagram(diagram);

      // then
      expect(result).to.exist;

      expectFetched(fetchSpy, {
        url: 'http://foo/flows?upsert=true'
      });
    });

    it('should throw when fetch fails', async () => {

      // given
      const api = createFlowedApi();

      // when
      fetchSpy.rejects(new TypeError('Failed to fetch'));

      // when
      let error;

      try {
        await api.deployDiagram(diagram);
      } catch (e) {
        error = e;
      } finally {

        // then
        expect(error).to.exist;
      }
    });


    it('should throw when response is not ok', async () => {

      // given
      const api = createFlowedApi();

      fetchSpy.resolves(new Response({ ok: false }));

      // when
      let error;

      try {
        await api.deployDiagram(diagram);
      } catch (e) {
        error = e;
      }

      // then
      expect(error).to.exist;
    });


    it('should handle failed response with non-JSON body', async () => {

      // given
      const api = createFlowedApi();

      fetchSpy.resolves(new Response({
        ok: false,
        status: 401,
        json: () => JSON.parse('401 Unauthorized')
      }));

      // when
      let error;

      try {
        await api.deployDiagram(diagram);
      } catch (e) {
        error = e;
      } finally {

        // then
        expect(error).to.exist;
      }
    });

  });


  describe('#checkConnection', () => {

    it('should check server connection', async () => {

      // given
      const api = createFlowedApi();

      fetchSpy.resolves(new Response());

      // when
      await api.checkConnection();
    });


    it('should throw when fetch fails', async () => {

      // given
      const api = createFlowedApi();

      fetchSpy.rejects(new TypeError('Failed to fetch'));

      // when
      let error;

      try {
        await api.checkConnection();
      } catch (e) {
        error = e;
      } finally {

        // then
        expect(error).to.exist;
      }
    });


    it('should throw when response is not ok', async () => {

      // given
      const api = createFlowedApi();

      fetchSpy.resolves(new Response({ ok: false }));

      // when
      let error;

      try {
        await api.checkConnection();
      } catch (e) {
        error = e;
      } finally {

        // then
        expect(error).to.exist;
      }
    });


    it('should handle failed response with non-JSON body', async () => {

      // given
      const api = createFlowedApi();

      fetchSpy.resolves(new Response({
        ok: false,
        status: 401,
        json: () => JSON.parse('401 Unauthorized')
      }));

      // when
      let error;

      try {
        await api.checkConnection();
      } catch (e) {
        error = e;
      } finally {

        // then
        expect(error).to.exist;
      }
    });


    describe('timeout handling', () => {

      let clock;

      before(() => {
        clock = sinon.useFakeTimers();
      });

      after(() => clock.restore());


      it('should abort request on timeout', async () => {

        // given
        const api = createFlowedApi();

        fetchSpy.callsFake((_, { signal }) => {
          return new Promise(resolve => {
            for (let i = 0; i < 10; i++) {
              if (signal && signal.aborted) {
                throw new Error('timeout');
              }

              clock.tick(2000);
            }

            resolve(new Response());
          });
        });

        // when
        let error;

        try {
          await api.checkConnection();
        } catch (e) {
          error = e;
        } finally {

          // then
          expect(error).to.exist;
        }
      });

    });

  });


  describe('#startInstance', () => {

    const processDefinition = {
      id: 'processDefinition'
    };

    const options = {
      businessKey: 'businessKey'
    };

    it('should start process', async () => {

      // given
      const api = createFlowedApi({
        url: 'http://foo'
      });

      // when
      fetchSpy.resolves(new Response());

      const result = await api.startInstance(processDefinition, options);

      // then
      expect(result).to.exist;

      expectFetched(fetchSpy, {
        url: 'http://foo/process-definition/processDefinition/start'
      });
    });


    it('should throw when fetch fails', async () => {

      // given
      const api = createFlowedApi();

      // when
      fetchSpy.rejects(new TypeError('Failed to fetch'));

      // when
      let error;

      try {
        await api.startInstance(processDefinition, options);
      } catch (e) {
        error = e;
      } finally {

        // then
        expect(error).to.exist;
      }
    });


    it('should throw when response is not ok', async () => {

      // given
      const api = createFlowedApi();

      fetchSpy.resolves(new Response({ ok: false }));

      // when
      let error;

      try {
        await api.startInstance(processDefinition, options);
      } catch (e) {
        error = e;
      }

      // then
      expect(error).to.exist;
    });

  });

});


// helpers //////////
function Response({
  ok = true,
  status = 200,
  json = async () => {
    return {};
  }
} = {}) {
  this.ok = ok;
  this.status = status;
  this.json = json;
}


function createFlowedApi(props = {}) {

  return new FlowedApi({
    url: 'http://localhost:4001/test/',
    ...props
  });

}

function expectFetched(fetchSpy, expectedOptions) {

  const {
    url,
    ...options
  } = expectedOptions;

  expect(fetchSpy).to.have.been.calledOnce;

  const [ argUrl, argOptions ] = fetchSpy.args[0];

  expect(fetchSpy).to.have.been.calledWith(url || argUrl, {
    ...argOptions,
    ...options
  });

}
