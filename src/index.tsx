import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import store from "./store";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
      <Provider store={store}>
          <BrowserRouter>
              <App />
          </BrowserRouter>
      </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
export {calcValues} from "./utils/nodes";
export {putInTexBrackets} from "./utils/nodes";
export {formatSmart} from "./utils/nodes";
export {deriveImplicit} from "./utils/nodes";
export {deriveSmart} from "./utils/nodes";
export {deriveAndSimplify} from "./utils/nodes";
export {derive} from "./utils/nodes";
export {simplify} from "./utils/nodes";