# fetch-hooks

> React hooks wrapping Fetch

[![NPM](https://img.shields.io/npm/v/fetch-hooks.svg)](https://www.npmjs.com/package/fetch-hooks) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save fetch-hooks
```

## Usage
`useFetch` will offer you a few properties in the return object (`resource`):

|property|usage|
---------|-----|
|data|This is the data parsed from the http response. It is not modified when the fetch beings, because you may want to keep displaying it while updates are loaded. You can always elect not to show it while `resource.loading`|
|error|This property is truthy when an error has occurred. It is cleared upon a successful response. The `inner` property should hold the value that was thrown or parsed|
|loading|This value is `true` when there is an outstanding request; `false` otherwise.|
|loaded|As soon as the first request is finished, this value is `true`; `false` otherwise.|
|request|This object represents the request itself. The `promise` should be chainable (WIP: it does not work yet). The `status` of the response and `url` we requested are stored here. `status` is 0 when the request is outstanding. It is set as soon as it ends.|


Sample follows:
```tsx
import * as React from 'react'

import { StatusWrapper, useFetch } from 'fetch-hooks';

const SampleComponent = () => {
  const [dataToLoad, setDataToLoad] = useState('posts');
  const [resource] = useFetch('https://my-json-server.typicode.com/typicode/demo/' + dataToLoad, { method: 'get', headers: {} } );
  return (
    <div>
      {
        // allow the user to make choices that affect what we load
        ['posts', 'comments'].map(
          item => (<button disabled={ item === dataToLoad } onClick={ () => setDataToLoad(item) }>{ item }</button>)
        )
      }
      <StatusWrapper fetched={resource}>
        <pre>
          {
            JSON.stringify(resource, null, 2)
          }
        </pre>
      </StatusWrapper>
    </div>
  );
}

ReactDOM.render(
  <SampleComponent />,
  document.getElementById('root')
);

```

## License

MIT © [benhorst](https://github.com/benhorst)
