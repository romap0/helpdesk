import Vue from 'vue'
import Router from 'vue-router'
import Tickets from '../components/tickets/Tickets'
import EditTicket from '../components/tickets/EditTicket'
import Layout from '../components/Layout'
import Users from '../components/users/Users'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/tickets',
      children: [
        {
          path: '/tickets/:id',
          name: 'Edit Ticket',
          component: EditTicket,
          props: true
        },
        {
          path: '/tickets',
          name: 'Tickets',
          component: Tickets
        },
        {
          path: '/users',
          name: 'Users',
          component: Users
        }
      ]
    }
  ]
})
