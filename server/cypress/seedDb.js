const { seed } = require('../seeders/seed');

seed().then(() => {
  console.log('Vmt Seeding done!');
});
