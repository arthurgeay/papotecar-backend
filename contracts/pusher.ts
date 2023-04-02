declare module '@ioc:Messenger/Pusher' {
  import Pusher from 'providers/MessengerProvider/pusher'

  const PusherMessenger: Pusher

  export default PusherMessenger
}
