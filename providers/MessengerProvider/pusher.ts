import { pusherConfig } from 'Config/pusher'
import Pusher from 'pusher'

export default class Messenger {
  protected messenger: Pusher

  constructor(config: typeof pusherConfig) {
    this.messenger = new Pusher(config)
  }

  public async trigger(
    channel: string,
    event: string,
    data: any,
    params?: Pusher.TriggerParams | undefined
  ) {
    await this.messenger.trigger(channel, event, data, params)
  }
}
