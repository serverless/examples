/*
* Demo App
*/

import React, { useEffect, useRef, useState } from 'react'
import logo from './images/logo.png'
import './DemoApp.css'

const INITIAL_API_REQUESTS = 50
const INITIAL_STATUS = 'Ready for testing!'

const defaultAdminState = {}
defaultAdminState.status = INITIAL_STATUS
defaultAdminState.invocations = INITIAL_API_REQUESTS
defaultAdminState.url = null

const defaultVisibleState = {}
defaultVisibleState.admin = false
defaultVisibleState.success = false

/*
* Component – DemoApp
*/

const DemoApp = () => {
  const [adminState, setAdminState] = useState(defaultAdminState)
  const [visibleState, setVisibleState] = useState(defaultVisibleState)

  const refFormName = useRef()
  const refFormEmail = useRef()
  const refInputUrl = useRef()
  const refInputInvocations = useRef()
  let timeout = undefined

  /**
    * Component Did Mount
    */

  useEffect(() => {
    // Get Global State from local storage    
    let data = localStorage.getItem('demoapp')
    data = data ? JSON.parse(data) : {}

    // Initial Session Status
    let newState = {
      ...defaultAdminState,
      url: data.url
    }
    if (!newState.url) {
      newState.status = 'Please insert the URL of your Form\'s API in the field below.'
    }

    setAdminState(newState)

    console.log('Serverless Enterprise Demo App Initialized')
    console.log('adminState', newState)
  }, [])

  /**
   * Toggle Admin
   */

  const toggleAdmin = () => {
    let newState = { admin: !visibleState.admin }
    setVisibleState({ ...visibleState, ...newState })
  }

  /**
   * Set Status
   */

  const setStatus = (status) => {
    clearTimeout(timeout)
    setAdminState({ ...adminState, ...{ status } })
    timeout = setTimeout(() => {
      setAdminState({ ...adminState, ...{ status: `Ready for testing!` } })
    }, 6000)
  }

  /**
   * Submit Form
   */

  const submitForm = (event) => {

    event.preventDefault()
    const name = refFormName.current.value
    const email = refFormEmail.current.value

    if (!name || name === '' || !email || email === '') {
      alert('Form fields must be filled in')
      return
    }

    const callApi = () => {
      return fetch(adminState.url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })
    }

    return callApi()
      .then(() => {
        setVisibleState({ ...visibleState, ...{ success: true } })
      })
  }

  /**
   * Update API
   */

  const updateApi = (event) => {

    event.preventDefault()

    let url = refInputUrl.current.value
    url = url.trim() || null

    function validURL(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
      return !!pattern.test(str);
    }

    if (!validURL(url)) {
      alert(`This is not a valid URL: ${url || '(Field is blank)'}`)
      return
    }

    const newState = { url: url }
    setAdminState({ ...adminState, ...newState })
    localStorage.setItem('demoapp', JSON.stringify({ url }))
    setStatus('API URL successfully updated!')
  }

  /**
   * Generate Invocations
   */

  const generateInvocations = (event) => {

    event.preventDefault()

    let invocations = refInputInvocations.current.value || adminState.invocations
    invocations = parseInt(invocations) || 0

    if (invocations > 999) {
      //eslint-disable-next-line
      const r = confirm(`\nThis will generate ${invocations} API requests.  Are you sure you want to do this?\n`)
      if (!r) return
    }

    // Call API Function
    const callApi = () => {
      return fetch(adminState.url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Sample Invocation',
          email: 'sample@invocations.com'
        }),
      })
    }

    // Runner Function
    const runner = async (cb) => {
      let array = []
      for (let i = 0; i <= invocations; i++) { array.push(i) }
      for (const item of array) {
        await callApi()
        setStatus(`Performing API request ${item}/${invocations}...`)
      }
      if (cb) return cb()
    }

    runner(() => {
      setStatus(`Successfully completed ${invocations} requests!`)
    })
  }

  /**
   * Generate Random Error
   */

  const generateRandomError = (event) => {

    event.preventDefault()

    // Call API Function
    const callApi = () => {
      return fetch(`${adminState.url}?error=true`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Sample Error Invocation',
          email: 'sampleerror@invocations.com'
        }),
      })
    }

    // Runner Function
    const runner = async (cb) => {
      try { await callApi() }
      catch (error) { console.log(error) }
      setStatus(`Generating a random function error...`)
      if (cb) return cb()
    }

    runner(() => {
      setStatus(`Successfully generated a random function error!`)
    })
  }

  /*
  * Render
  */

  return (
    <div className='DemoApp'>

      {
        /*
         * DemoApp Admin Menu
        */
      }

      <section className={`DemoApp-admin ${visibleState.admin ? `visible` : ``}`}>

        <div
          className='admin-close'
          onClick={toggleAdmin}>
          x
        </div>

        <div className='admin-logo'>
          <img src={logo} alt="logo" />
          Serverless Framework Enterprise - Demo Utilities
        </div>

        <div className='admin-section'
          style={{ display: `${adminState.status ? 'flex' : 'none'}` }}>
          <div className='admin-label'>
            Status
          </div>
          <p className='admin-status'>
            {adminState.status}
          </p>
        </div>

        <div className='admin-section'>
          <div className='admin-label'>
            Form Submit URL
          </div>
          <form className='admin-section-field'>
            <input
              type='text'
              className='admin-input'
              placeholder={adminState.url || 'Enter the formSubmit API URL here...'}
              ref={refInputUrl}
            />
            <input
              type='submit'
              className='admin-button'
              value='Set'
              onClick={updateApi}
            >
            </input>
          </form>
          <div className='admin-input-description'>
            Enter the formSubmit function's API URL returned upon deployment with the Framework.
          </div>
        </div>

        <div className='admin-section'>
          <div className='admin-label'>
            Generate A Sample Number Of API Requests
          </div>
          <form className='admin-section-field'>
            <input
              type='number'
              className='admin-input'
              placeholder={adminState.invocations}
              ref={refInputInvocations}
            />
            <input
              type='submit'
              className='admin-button'
              value='Generate'
              onClick={generateInvocations}
            >
            </input>
          </form>
          <div className='admin-input-description'>
            This generates fake form submissions to give you sample invocation data.
          </div>
        </div>

        <div className='admin-section'>
          <div className='admin-section-general'>
            <div className='admin-section-general-description'>
              <div className='admin-label'>
                Generate A New Function Code Error
              </div>
              <div>
                This generates a new Function Code Error.
              </div>
            </div>
            <div className='admin-section-general-button'>
              <div
                className='admin-button'
                onClick={generateRandomError}>Generate</div>
            </div>
          </div>
        </div>

        {
          // <div className='admin-section'>
          //   <div className='admin-section-general'>
          //     <div className='admin-section-general-description'>
          //       <div className='admin-label'>
          //         Generate A Long Running Function
          //       </div>
          //       <div>
          //         This generates an unusually long function duration.
          //       </div>
          //     </div>
          //     <div className='admin-section-general-button'>
          //       <div className='admin-button'>Generate</div>
          //     </div>
          //   </div>
          // </div>
        }

      </section>

      {
        /*
         * DemoApp Content
        */
      }

      <section className="DemoApp-content">

        <div className="admin-link animated fadeIn" onClick={toggleAdmin}>
          Demo Utilities
        </div>

        <div className='container animated zoomIn'>

          <div className='form-header' style={{ display: `${visibleState.success ? 'none' : 'flex'}` }}>
            Serverless Email Sign-Up Form
          </div>

          <form className='form' style={{ display: `${visibleState.success ? 'none' : 'flex'}` }}>
            <div className='form-field-label'>
              Full Name
            </div>
            <input
              type='text'
              className='form-field-input'
              placeholder='Allison Bensely'
              ref={refFormName}>
            </input>
            <div className='form-field-label'>
              Email
            </div>
            <input
              type='email'
              className='form-field-input'
              placeholder='allison.bensely@gmail.com'
              ref={refFormEmail}>
            </input>
            <div className='form-field-button-container'>
              <input type='submit' className='form-field-button' onClick={submitForm}></input>
            </div>
          </form>

          <div className='success animated fadeInUp' style={{ display: `${visibleState.success ? 'flex' : 'none'}` }}>
            Thank you for your submission!
          </div>

        </div>

      </section>
    </div>
  )
}

export default DemoApp
