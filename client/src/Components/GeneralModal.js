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
  const [show, setShow] = useState(false);
  const [child, setChild] = useState(null);
  const [options, setOptions] = useState({});
  const [isBig, setIsBig] = useState(false);

  // @TODO Ugh...this function should take a 'type' as parameter, whether Modal or BigModal, and the return/render below should create a component of that type.
  // Unfortunately, I couldn't get that more extensible approach to work in the short time I tried.
  const _show = (makeBig) => {
    return (component, newOptions) => {
      setChild(component);
      setShow(true);
      setIsBig(makeBig);
      if (newOptions) setOptions(newOptions);
    };
  };

  return (
    <ModalContext.Provider
      value={{
        show: _show(false),
        showBig: _show(true),
        hide: () => setShow(false),
      }}
    >
      {isBig ? (
        <BigModal show={show} closeModal={() => setShow(false)} {...options}>
          {child}
        </BigModal>
      ) : (
        <Modal show={show} closeModal={() => setShow(false)} {...options}>
          {child}
        </Modal>
      )}
      {children}
    </ModalContext.Provider>
  );
}
