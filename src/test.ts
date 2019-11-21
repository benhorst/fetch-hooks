import {
  ExampleComponent,
  fetchReducer,
  PRISTINE_FETCH_STATE,
} from './'

describe('fetch hooks', () => {

  describe('fetch reducer', () => {
    it('exists', () => {
      expect(fetchReducer).toBeTruthy();
    });
    describe('initialState', () => {
      it('exists', () => {
        expect(PRISTINE_FETCH_STATE).toBeTruthy();
      });
      it('has not been loaded', () => {
        // explicitly a bool
        expect(PRISTINE_FETCH_STATE.loaded).toBe(false);
      });
      it('is not loading', () => {
        // explicitly a bool
        expect(PRISTINE_FETCH_STATE.loading).toBe(false);
      });
      it('has no error', () => {
        // falsey is good enough. false/null are both ok.
        expect(PRISTINE_FETCH_STATE.error).toBeFalsy();
      });
      it('has no request yet', () => {
        expect(PRISTINE_FETCH_STATE.request).toBe(null);
      });
      it('has no data', () => {
        expect(PRISTINE_FETCH_STATE.data).toBe(null);
      });
    });
    describe('actions:', () => {
      describe('init', () => {
        it('returns a fresh reference to initial state', () => {
          const result = fetchReducer(PRISTINE_FETCH_STATE, { type: 'init' });
          expect(result).not.toBe(PRISTINE_FETCH_STATE);
        });
        it('resets all state to PRISTINE', () => {
          const result = fetchReducer(PRISTINE_FETCH_STATE, { type: 'init' });
          expect(result).toEqual(PRISTINE_FETCH_STATE);
        });
      });
      describe('start-load', () => {
        it('sets loading=true', () => {
          const result = fetchReducer(PRISTINE_FETCH_STATE, { type: 'start-load', payload: { url: 'foo', promise: Promise.resolve() } });
          expect(result.loading).toBe(true);
        });
        it('leaves loaded=false', () => {
          const result = fetchReducer(PRISTINE_FETCH_STATE, { type: 'start-load', payload: { url: 'foo', promise: Promise.resolve() } });
          expect(result.loaded).toBe(false);
        });
      });
      describe('end-load', () => {
        it('sets loading=false', () => {
          const result = fetchReducer(PRISTINE_FETCH_STATE, { type: 'end-load', payload: { data: {}, request: { status: 200 } } });
          expect(result.loading).toBe(false);
        });
        it('sets loaded=true', () => {
          const result = fetchReducer(PRISTINE_FETCH_STATE, { type: 'end-load', payload: { data: {}, request: { status: 200 } } });
          expect(result.loaded).toBe(true);
        });
      });
      describe('abort', () => {
        it('returns a fresh reference to initial state', () => {
          const result = fetchReducer(PRISTINE_FETCH_STATE, { type: 'abort' });
          expect(result).not.toBe(PRISTINE_FETCH_STATE);
        });
        it('sets error=\'aborted\', the rest is initial state', () => {
          const result = fetchReducer(PRISTINE_FETCH_STATE, { type: 'abort' });
          expect(result).toEqual({ ...PRISTINE_FETCH_STATE, error: 'aborted' });
        });
      });
    });
  });

  describe('ExampleComponent', () => {
    it('is truthy/exists', () => {
      expect(ExampleComponent).toBeTruthy();
    });
  });
});
