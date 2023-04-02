import Env from '@ioc:Adonis/Core/Env'

export const pusherConfig = {
  appId: Env.get('PUSHER_APP_ID'),
  key: Env.get('PUSHER_APP_KEY'),
  secret: Env.get('PUSHER_APP_SECRET'),
  cluster: 'eu',
  useTls: true,
}
