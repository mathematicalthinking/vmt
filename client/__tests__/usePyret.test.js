import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { usePyret } from '../src/utils/utilityHooks'; // adjust the path as needed

describe('usePyret hook', () => {
  let iframeRef;
  let onMessage;
  let initialState;

  beforeEach(() => {
    iframeRef = { current: document.createElement('iframe') };
    onMessage = jest.fn();
    initialState = JSON.stringify({
      data: [
        {
          currentState: { key: 'value' },
        },
      ],
    });
    document.body.appendChild(iframeRef.current);
  });

  afterEach(() => {
    document.body.removeChild(iframeRef.current);
  });

  test('initialState sets the iframeSrc correctly', () => {
    const { result } = renderHook(() =>
      usePyret(iframeRef, onMessage, initialState)
    );

    expect(result.current.iframeSrc).toContain(
      encodeURIComponent(JSON.stringify({ key: 'value' }))
    );
  });

  test('iframeRef gets the handler added and isReady boolean works', () => {
    const { result } = renderHook(() =>
      usePyret(iframeRef, onMessage, initialState)
    );

    expect(result.current.isReady).toBe(false);

    act(() => {
      iframeRef.current.dispatchEvent(new Event('load'));
    });

    expect(result.current.isReady).toBe(true);
  });

  test('onMessage executes correctly when a windows.onmessage event is sent', async () => {
    const { result } = renderHook(() =>
      usePyret(iframeRef, onMessage, initialState)
    );

    // Ensure the load event is dispatched and the isReady state is true
    await act(async () => {
      iframeRef.current.dispatchEvent(new Event('load'));
    });

    // Post a message and check if onMessage is called correctly
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { protocol: 'pyret', data: { key: 'value' } },
        })
      );
    });

    expect(onMessage).toHaveBeenCalledWith({
      protocol: 'pyret',
      data: { key: 'value' },
    });
  });

  test('window.onmessage does not call onMessage if protocol is not pyret', () => {
    const { result } = renderHook(() =>
      usePyret(iframeRef, onMessage, initialState)
    );

    act(() => {
      iframeRef.current.dispatchEvent(new Event('load'));
    });

    act(() => {
      window.postMessage({ protocol: 'not_pyret' }, '*');
    });

    expect(onMessage).not.toHaveBeenCalled();
  });

  test('postMessage sends data to iframe contentWindow', () => {
    iframeRef.current.contentWindow.postMessage = jest.fn();
    const { result } = renderHook(() =>
      usePyret(iframeRef, onMessage, initialState)
    );

    // Simulate the iframe load event
    act(() => {
      iframeRef.current.dispatchEvent(new Event('load'));
    });

    const postMessageData = { type: 'test' };
    act(() => result.current.postMessage(postMessageData));

    expect(iframeRef.current.contentWindow.postMessage).toHaveBeenCalledWith(
      postMessageData,
      '*'
    );
  });

  test('calls old window.onmessage if protocol is not pyret', () => {
    const oldOnMessage = jest.fn();
    window.onmessage = oldOnMessage;

    const { result } = renderHook(() =>
      usePyret(iframeRef, onMessage, initialState)
    );

    // Simulate the iframe load event
    act(() => {
      iframeRef.current.dispatchEvent(new Event('load'));
    });

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { protocol: 'invalid', data: { key: 'value' } },
        })
      );
    });

    expect(oldOnMessage).toHaveBeenCalled();
  });

  test('ignores postMessage before iFrame load', () => {
    iframeRef.current.contentWindow.postMessage = jest.fn();
    const { result } = renderHook(() =>
      usePyret(iframeRef, onMessage, initialState)
    );

    const postMessageData = { type: 'test' };
    act(() => {
      result.current.postMessage(postMessageData);
    });

    expect(iframeRef.current.contentWindow.postMessage).not.toHaveBeenCalled();
  });
});
