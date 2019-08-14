const clearInputByName = (name) => {
  cy.get(`input[name=${name}]`).clear();
};
const typeInputByName = (name, text) => {
  cy.get(`input[name=${name}]`).type(text);
};

module.exports = {
  clearInputByName,
  typeInputByName,
};
