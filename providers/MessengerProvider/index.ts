import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class MessengerProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Messenger/Pusher', () => {
      const { pusherConfig } = this.app.config.get('pusher')
      const PusherMessenger = require('./pusher').default

      return new PusherMessenger(pusherConfig)
    })
  }

  public async boot() {
    // All bindings are ready, feel free to use them
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
