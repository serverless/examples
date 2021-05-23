import { HelloService } from './helloService'

describe('hello service', () => {
  const helloService = new HelloService()
  it('should return hello string', () => {
    const helloString = helloService.execute()
    expect(helloString).toBe('Hello!!')
  })
})
