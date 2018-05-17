exports = class DbSession {
  constructor (db) {
    this.db = db

    this.options = {
      property: 'session',
      getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`
    }
  }

  getSession (key) {
    return new Promise((resolve, reject) => {
      this.db.get(key)
        .then(
          session => {
            try {
              resolve(session)
            } catch (error) {
              console.error(error.message)
              resolve({})
            }
          },
          err => {
            console.error(err.message)
            resolve({})
          })
    })
  }

  clearSession (key) {
    return new Promise((resolve, reject) => {
      this.db.delete(key)
        .then(
          json => resolve(),
          err => reject(err))
    })
  }

  saveSession (key, session) {
    console.log('save', key, session)
    if (!session || Object.keys(session).length === 0) {
      console.log('clear')
      return this.clearSession(key)
    }

    return new Promise((resolve, reject) => {
      this.db.set(key, session)
        .then(
          json => resolve({}),
          err => reject(err))
    })
  }

  middleware () {
    return (ctx, next) => {
      const key = this.options.getSessionKey(ctx)
      if (!key) {
        return next()
      }

      this.getSession(key).then(session => {
        Object.defineProperty(ctx, this.options.property, {
          get: function () {
            console.log('get', session)
            return session
          },
          set: function (newValue) {
            console.log('set', newValue)
            session = Object.assign({}, newValue)
          }
        })

        return next(ctx).then(() => this.saveSession(key, session))
      })
    }
  }
}
