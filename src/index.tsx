import * as React from 'react';
const { useReducer, useEffect, useState } = React;

export const ERROR_CODES = {
  FAIL_FETCH: -100, // the network call failed or was interrupted, usually
  FAIL_PARSE: -200, // the parser provided threw. (usually json)
  FAIL_PARSE_TEXT: -201, // response.text() threw.
}
// NOTE TO FRIENDS: sorry about the semi-inconsistent semi-colons.

interface FetchRequest {
  url?: string
  status?: number
  // this promise is currently the FetchPromise.
  // TODO: likely a consumer would actually want the ParsedPromise,
  //       aka: the thing that has error/data in it, NOT the pre-parsed response.
  promise?: Promise<any>
}
interface FetchRequestEndPayload {
  status: number
}
interface FetchRequestStartPayload {
  url: string
  promise: Promise<any>
}

export const PRISTINE_FETCH_STATE = {
  data: null,
  error: null,
  loading: false,
  loaded: false,
  request: null,
}

interface StartLoadAction {
  type: 'start-load',
  payload: FetchRequestStartPayload
}
interface EndLoadFailAction {
  type: 'end-load',
  payload: {
    data?: undefined
    error: any,
    request: FetchRequestEndPayload
  }
}
interface EndLoadSuccessAction {
  type: 'end-load',
  payload: {
    data: any
    error?: undefined
    request: FetchRequestEndPayload
  }
}
type EndLoadAction = EndLoadSuccessAction | EndLoadFailAction;

interface InitAction {
  type: 'init',
  payload?: undefined
}
interface AbortAction {
  type: 'abort',
  payload?: undefined
}
type FetchReducerAction = StartLoadAction | EndLoadAction | InitAction | AbortAction;
interface UseFetchOptions {
  parser: (input:string) => any
}
interface FetchState {
  data: any | null,
  error: any | null,
  loading: boolean,
  loaded: boolean,
  request?: FetchRequest | null,
}

export const fetchReducer = (state: FetchState, action: FetchReducerAction): FetchState => {
  const { type } = action;
  switch (type) {
    case 'init':
      return { ...PRISTINE_FETCH_STATE };
    case 'start-load': {
      const { payload } = action as StartLoadAction;
      // on initial state, the status=0 because we don't know yet, but the previous one is gone
      return {
        ...state,
        loading: true,
        request: {
          status: 0,
          url: payload.url,
          promise: payload.promise,
        },
      };
    }
    case 'end-load': {
      const { payload } = action as EndLoadAction;
      return {
        ...state,
        data: payload.data,
        error: payload.error,
        loading: false,
        loaded: true,
        request: {
          ...state.request,
          ...payload.request,
        },
      };
    }
    case 'abort': {
      // const { payload } = action as EndLoadAction;
      return {
        ...PRISTINE_FETCH_STATE,
        error: 'aborted'
      };
    }
    default:
      throw new Error();
  }
}

const DEFAULT_FETCH_OPTIONS = {
    method: 'get',
    credentials: 'include',
}
const jsonString = (input:string) => JSON.parse(input);
export const useFetch = (
  url:string,
  fetchOptions: any = DEFAULT_FETCH_OPTIONS,
  // by default, we'll parse the output as json.
  options: UseFetchOptions = { parser: jsonString }
) => {
    const [state, dispatch] = useReducer(fetchReducer, PRISTINE_FETCH_STATE);
    useEffect(() => {
        let error:any = null;
        let status:number = 0;

        const request = fetch(url, fetchOptions)
        // first stage of response, should be 'ok' or not
        .then(response => {
          if (!response.ok) {
            error = { message: 'Http-status not OK:' + response.status };
          }
          status = response.status;
          return response.text();
        }, (err) => {
          // fetch failed completely
          dispatch({
            type: 'end-load',
            payload: {
              error: { message: 'failed to fetch.', inner: err },
              request: {
                status: ERROR_CODES.FAIL_FETCH,
              }
            }
          });
        })
        // next we enter the parsing stage
        .then(body => {
          let json:any;
          try {
            if (body) {
              json = options.parser(body);
            }
            dispatch({
              type: 'end-load',
              payload: {
                request: {
                  status,
                },
                error,
                data: json || body
              }
            });
          } catch (ex) {
            // the parser failed to get what it wanted.
            dispatch({
              type: 'end-load',
              payload: {
                error: { message: 'Failed to parse the body of the response.', inner: { exception: ex, body } },
                request: {
                  status: ERROR_CODES.FAIL_PARSE,
                }
              }
            });
          }

        }, (err) => {
          // turning the response into text failed.
          dispatch({
            type: 'end-load',
            payload: {
              error: { message: 'Failed to parse the body text completely.', inner: err },
              request: {
                status: ERROR_CODES.FAIL_PARSE_TEXT,
              }
            }
          });
        });
      dispatch({
        type: 'start-load',
        payload: {
          promise: request,
          url,
        }
      });
    }, [url]);

    return [state];
};

interface StatusWrapperProps {
  fetched: FetchState
  children: React.ReactNode
}
export const StatusWrapper = (props:StatusWrapperProps) => {
  const { fetched, children } = props;
  return (
    <React.Fragment>
      { fetched.loading ? <div>loading</div> : <div>not loading</div> }
      <div>loaded: { fetched.loaded && 'check' }</div>
      { fetched.error &&
        (
          <div className="failure">
            An error has occurred (status:{ fetched.request && fetched.request.status })
            <pre>{ JSON.stringify(fetched.error, null, 2) }</pre>
          </div>
        )
      }
      {
        // if you want the children to show while loading (after initial load)
        // then just remove the middle expression and let it ride.
        !fetched.error && !fetched.loading && fetched.loaded && (
          <div className="success">
            This is the data!
            { children }
          </div>
        )
      }
    </React.Fragment>
  )
};

export const ExampleComponent = () => {
  const [url, setUrl] = useState('https://my-json-server.typicode.com/typicode/demo/posts');
  const [data] = useFetch(url, { method: 'get', headers: {} } );
  return (
    <div>
      <input style={ { width: '100%' } } type="text" value={ url } onChange={ ev => setUrl(ev.target.value) } />
      <StatusWrapper fetched={data}>
        <pre>
          {
            JSON.stringify(data, null, 2)
          }
        </pre>
      </StatusWrapper>
    </div>
  );
}

// ReactDOM.render(
//   <SampleComponent />,
//   document.getElementById('root')
// );
