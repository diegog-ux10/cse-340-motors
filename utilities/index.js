const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **************************************
* Build the single vehicle view HTML
* ************************************ */
Util.buildVehicleGrid = async function(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '<p class="notice">Sorry, no matching vehicle could be found.</p>';
    }
  
    const vehicle = data[0];
  
    const formatNumber = (number) => new Intl.NumberFormat('en-US').format(number);
  
    const vehicleDetails = [
      { label: 'Price', value: `$${formatNumber(vehicle.inv_price)}` },
      { label: 'Description', value: vehicle.inv_description },
      { label: 'Miles', value: formatNumber(vehicle.inv_miles) },
      { label: 'Color', value: vehicle.inv_color },
      { label: 'Year', value: vehicle.inv_year }
    ];
  
    const detailsList = vehicleDetails
      .map(({ label, value }) => `<li><strong>${label}: </strong>${value}</li>`)
      .join('');
  
    return `
      <div id="singleVehicleWrapper">
        <img src="${vehicle.inv_image}" 
             alt="Image of ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}">
        <div class="vehicle-info-container">
          <ul id="singleVehicleDetails">
            <li><h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2></li>
            ${detailsList}
          </ul>
          <div class="action-buttons">
            <button class="action-btn">Start My Purchase</button>
            <button class="action-btn">Contact Us</button>
            <button class="action-btn">Schedule a Test Drive</button>
            <button class="action-btn">Apply for Financing</button>
          </div>
          <div class="contact-info">
            <h3>Contact Information</h3>
            <p>Phone: (555) 123-4567</p>
            <p>Email: sales@example.com</p>
            <p>Address: 123 Car Street, Autoville, ST 12345</p>
          </div>
        </div>
      </div>
    `;
  }

/* ****************************************
* Middleware For Handling Errors
* Wrap other function in this for 
* General Error Handling
**************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util