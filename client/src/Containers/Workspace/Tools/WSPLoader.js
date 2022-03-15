// Draft idea on how to dynamically load scripts

// const loadWSP = (callback) => {
//     const existingScript = document.getElementById('googleMaps');
//     if (!existingScript) {
//       const script = document.createElement('script');
//       script.src = 'https://maps.googleapis.com/maps/api/js';
//       script.id = 'googleMaps';
//       document.body.appendChild(script);
//       script.onload = () => { 
//         if (callback) callback();
//       };
//     }
//     if (existingScript && callback) callback();
//   };
//   export default loadWSP;


//   <script>
//   GSPConfig = { 
//     myConfigurationKey: myConfigurationValue
//   }
// </script>