const { seed } = require('../seeders/seed');

return seed().then(() => {
  console.log('Seeding done!');
});
