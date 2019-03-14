export default class BaseHandler {
  constructor() {
    this.handlerName = this.constructor.name
  }

  async execute(event, context) {
    console.log(`Executing handler ${this.handlerName}`)
    return this._process(event, context)
  }

  async _process(event, context) {
    console.log(event)
    console.log(context)
    console.log('Remember to overwrite this method if you need to provide custom handling logic.')
  }
}
