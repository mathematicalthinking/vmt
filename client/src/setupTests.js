// Import dependencies for React Testing Library
import '@testing-library/jest-dom/extend-expect';
global.window = { onmessage: jest.fn() };
window.env = { REACT_APP_SERVER_URL: 'http://localhost:3000' };

if (!Element.prototype.getRootNode) {
  Element.prototype.getRootNode = function() {
    return this.parentNode || this.getRootNode();
  };
}
