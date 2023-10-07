import React from 'react';
import Script from 'react-load-script';

const GeneralResources = () => {
  React.useEffect(async () => {
    if (!window.Player) {
      const { Player } = await import('../external/js/api.full');

      window.Player = await Player;
    }
  }, []);
  return (
    !window.Desmos && (
      <Script url="https://www.desmos.com/api/v1.5/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6" />
    )
  );
};

export default GeneralResources;
