import * as React from 'react';
const { useReducer, useEffect } = React;

interface FetchRequest {
  url: string
  status: number
  promise: Promise<any>
}
interface FetchResource<T> {
  data: T
  error: any
  loading: boolean
  loaded: boolean
  request: null | FetchRequest
}

const PRISTINE_FETCH_STATE = {
  data: null,
  error: null,
  loading: false,
  loaded: false,
  request: null,
}
interface Action {
  type: string
  payload: any
}

const fetchReducer = (state: FetchResource<any>, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case 'init':
      return PRISTINE_FETCH_STATE;
    case 'start-load':
      return {
        ...state,
        loading: true,
        request: {
          status: 0,
          url: payload.url,
          promise: payload.fetcher,
        },
      };
    case 'end-load':
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
    case 'abort':
      return {
        ...PRISTINE_FETCH_STATE,
        error: 'aborted'
      };
    default:
      throw new Error();
  }
  
}

const DEFAULT_FETCH_OPTIONS = {
    method: 'get',
    credentials: 'include',
}
export const useFetch = (url:string, fetchOptions: any = DEFAULT_FETCH_OPTIONS) => {
    const [state, dispatch] = useReducer(fetchReducer, PRISTINE_FETCH_STATE);
    useEffect(() => {
        let error:any = null;
        let status:number = 0;
        const request = fetch(url, fetchOptions)
          .then(response => {
            if (!response.ok) {
              error = true;
            }
            status = response.status;
            return response.text();
          }, (err) => {
            // fetch failed completely
            dispatch({
              type: 'end-load',
              payload: {
                error: { message: 'failed to fetch.', inner: err },
              }
            });
          }).then(text => {
            let json:any;
            try {
              if (text) {
                json = JSON.parse(text);
              }
              setTimeout(
                () => {
                  dispatch({
                    type: 'end-load',
                    payload: {
                      request: {
                        status,
                      },
                      loaded: true,
                      loading: false,
                      error,
                      data: json || text
                    }
                  });
                },
                3000
              )
              
            } catch (ex) {
              dispatch({
                type: 'end-load',
                payload: {
                  error: { message: 'failed to parse the response as json.', inner: ex },
                }
              });
            }

          }, (err) => {
            // turning the response into text failed.
            dispatch({
              type: 'end-load',
              payload: {
                error: { message: 'failed to fetch.', inner: err },
              }
            });
          })
          dispatch({
            type: 'start-load',
            payload: {
              fetcher: request,
              url,
            }
          });
    }, [url]);

    return [state];
};

interface StatusWrapperProps {
  fetched:FetchResource<any>
  children:React.ReactNode
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

// const SampleComponent = () => {
//   const [data] = useFetch('https://my-json-server.typicode.com/typicode/demo/posts', { method: 'get', headers: {} } );
//   return (
//     <StatusWrapper fetched={data}>
//       <pre>
//         {
//           JSON.stringify(data, null, 2)
//         }
//       </pre>
//     </StatusWrapper>
//   );
// }

// ReactDOM.render(
//   <SampleComponent />,
//   document.getElementById('root')
// );
