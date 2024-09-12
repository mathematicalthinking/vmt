import React, { createContext, useState } from 'react';
import BigModal from './UI/Modal/BigModal';
import Modal from './UI/Modal/Modal';

export const ModalContext = createContext({
  show: () => {},
  showBig: () => {},
  hide: () => {},
});

// eslint-disable-next-line react/prop-types
export default function GeneralModal({ children }) {
  const [modalStack, setModalStack] = useState([]);

  const _show = (makeBig) => {
    return (component, newOptions = {}) =>
      _push(component, makeBig, newOptions);
  };

  const _pop = () => setModalStack((prev) => prev.slice(0, -1));
  const _push = (component, isBig, options = {}) =>
    setModalStack((prev) => [
      ...prev,
      { component, isBig, options, key: Date.now() },
    ]);

  return (
    <ModalContext.Provider
      value={{
        show: _show(false),
        showBig: _show(true),
        hide: _pop,
      }}
    >
      {modalStack.map((modal) =>
        modal.isBig ? (
          <BigModal show closeModal={_pop} {...modal.options} key={modal.key}>
            {modal.component}
          </BigModal>
        ) : (
          <Modal show closeModal={_pop} {...modal.options} key={modal.key}>
            {modal.component}
          </Modal>
        )
      )}
      {children}
    </ModalContext.Provider>
  );
}
