import { App } from './app';
import { renderToString } from 'react-dom/server';

export function render() {
  return renderToString(<App />);
}
