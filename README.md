# fetch-hooks

> React hooks wrapping Fetch

[![NPM](https://img.shields.io/npm/v/fetch-hooks.svg)](https://www.npmjs.com/package/fetch-hooks) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save fetch-hooks
```

## Usage

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
          item => (<button disabled={ item === dataToLoad } onClick={ () => setDataToLoad(item)>{ item }</button>)
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
