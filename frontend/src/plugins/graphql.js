import Vue from 'vue'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { createHttpLink } from 'apollo-link-http'

Vue.use({
  install(Vue) {
    // ApolloLink
    const httpLink = createHttpLink({
      uri: 'http://localhost:4000/'
    })

    // ApolloLink
    const authLink = setContext((_, { headers }) => {
      const token = localStorage.getItem('token')
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : ''
        }
      }
    })

    Vue.prototype.$api = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache()
    })
  }
})