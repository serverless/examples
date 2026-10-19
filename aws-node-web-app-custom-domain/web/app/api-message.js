'use client'

import { useEffect, useState } from 'react'

export default function ApiMessage() {
  const [text, setText] = useState('Loading /api/hello…')

  useEffect(() => {
    // A relative URL: the request goes to the domain that served this page.
    fetch('/api/hello')
      .then((response) => response.json())
      .then((body) => setText(JSON.stringify(body, null, 2)))
      .catch((error) => setText(`Could not load /api/hello: ${error.message}`))
  }, [])

  return <pre>{text}</pre>
}
