import Freshdesk from 'freshdesk-api'
import Promise from 'bluebird'
require('dotenv-expand')(require('dotenv').config())

export default Promise.promisifyAll(new Freshdesk('https://pqlab.freshdesk.com', process.env.FRESHDESK_TOKEN))
