const db = require('../../database/index.js');

const role_controller = require('./role-controller.js');
const user_controller = require('./user-controller.js');
const company_controller = require('./company-controller.js');


const capitalizeWords = (array) => {
  let words = array;
  words = words.toLowerCase().split(' ');
  words = words.map(word => word[0].toUpperCase().concat(word.substr(1))).join(' ');
  return words;
};

const fillUsersName = applications => applications.map(app => user_controller
  .getFullNameById({ id: app.user_id }).then((user) => {
  app.user = `${user[0].first_name} ${user[0].last_name}`;
  return app;
}));

const fillRole = applications => Promise.all(applications).then(applications => applications.map(app => role_controller.getRoles({ id: app.role_id }).then(role => Promise.all(role).then((role) => {
  app.role = role[0];
  return app;
}))));

const updateRole = (query, role, company, salary) => role_controller.updateRole(query, role, company, salary);

const updateLocation = (query, city, state) => db.knex('applications').where(query).update({ city, state }).then(updated => updated);

module.exports = {
  getAllApplications: (query) => {
    if (query) {
      return db.knex('applications').where(query)
        .then(applications => fillUsersName(applications)).then(applications => fillRole(applications))
        .then(applications => applications);
    }
    return db.knex('applications')
      .then(applications => fillUsersName(applications)).then(applications => fillRole(applications)).then(applications => applications);
  },
  saveNewApplication: (values) => {
    // making sure grammar is correct.
    const name = capitalizeWords(values.company);
    const role = capitalizeWords(values.role);
    const city = capitalizeWords(values.city);
    const state = capitalizeWords(values.state);
    const salary = Number(values.salary) === NaN ? 0 : values.salary;
    let  accepted = values.accepted !== undefined ? values.accepted === 1 ? 1 : 0 : 0;
    let user_id = undefined;

    if(values.user_id) {
      user_id = values.user_id
    } else {
      throw new Error('User_id is needed to make an application');
    }

    // get the company information
    return company_controller.getCompanyByName({ name })
      .then((company) => {
      // if it does not exist
        if (!company.length) {
        // create new company
          return company_controller.saveNewCompany({ name }).then(id =>
          // return index of company
            Promise.all(id).then(id => id[0]));
        }
        return company;
      })
      .then((company) => {
        company = typeof company === 'object' ? company[0].id : company;
        return role_controller.saveNewRole({ name: role, company_id: company, salary })
          .then(roleIndex => db.knex('applications')
            .insert({ user_id: user_id, role_id: roleIndex[0], city: city, state: state, accepted: accepted }));
      })
      .then(application => db.knex('applications').select().where({ id: application[0] })
        .then(application => fillUsersName(application))
        .then(application => fillRole(application)))
      .then(application => application);
  },
  updateApplication: (params) => {
    let {
      city, state, company, salary, role, accepted
    } = params.body;
    const { id } = params.query;
    city = capitalizeWords(city);
    state = capitalizeWords(state);
    company = capitalizeWords(company);
    role = capitalizeWords(role);
    salary = isNaN(salary) === NaN ? 0 : salary;

    if( !id ) {
      throw new Error('Application Id is needed as a query after the endpoints')
    }

    return db.knex('applications').where({ id }).then((application) => {
      (application[0].city !== city || application[0].state !== state) ?
        updateLocation({ id: application[0].id }, city, state) : undefined;
      updateRole({ id: application[0].role_id }, role, company, salary);

      if(!accepted) {
        accepted = application[0].accepted;
      }

      let result = { application, accepted }
      return result;
    }).then(results => {
      return db.knex('applications').where({ id: results.application[0].id }).update({ accepted: results.accepted })
      .then( () => {
        return db.knex('applications').where({id: results.application[0].id});
      });
    });
  },
};

