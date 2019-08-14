const { seed } = require('../seeders/seed');

seed().then(() => {
  console.log('Seeding done!');
});
