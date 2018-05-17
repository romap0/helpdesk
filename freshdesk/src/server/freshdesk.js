const Freshdesk = require('freshdesk-api')
const Promise = require('bluebird')

exports = (domain, token) => Promise.promisifyAll(new Freshdesk(domain, token))
