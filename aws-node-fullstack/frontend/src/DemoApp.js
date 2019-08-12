/*
* Demo App
*/

import React, { Component } from 'react'
import logo from './images/logo.png'
import './DemoApp.css'

const INITIAL_API_REQUESTS = 50
const INITIAL_STATUS = 'Ready for testing!'

/*
* Class – DemoApp
*/

class DemoApp extends Component {

  /*
  * Constructor
  */

  constructor(props) {
    super(props)

    this.state = {}
    this.state.visible = {}
    this.state.visible.admin = false
    this.state.visible.success = false
    this.state.admin = {}
    this.state.admin.status = INITIAL_STATUS
    this.state.admin.invocations = INITIAL_API_REQUESTS
    this.state.admin.url = null

    // Refs
    this.refFormName = React.createRef()
    this.refFormEmail = React.createRef()
    this.refInputUrl = React.createRef()
    this.refInputInvocations = React.createRef()

    // Binders
    this.submitForm = this.submitForm.bind(this)
    this.toggleAdmin = this.toggleAdmin.bind(this)
    this.updateApi = this.updateApi.bind(this)
    this.generateInvocations = this.generateInvocations.bind(this)
    this.generateRandomError = this.generateRandomError.bind(this)
  }

  /**
   * Component Did Mount
   */

  componentDidMount() {
    const self = this
    // Get Global State from local storage
    let data = localStorage.getItem('demoapp')
    data = data ? JSON.parse(data) : {}
    this.setState({ admin: { ...this.state.admin, ...{ url: data.url }}}, () => {
      console.log('Serverless Enterprise Demo App Initialized')
      console.log(this.state)

      // Initial Session Status
      let newState = {
        status: INITIAL_STATUS,
        invocations: INITIAL_API_REQUESTS,
      }
      if (!this.state.admin.url) {
        newState.status = 'Please insert the URL of your Form\'s API in the field below.'
      }

      this.setState({ admin: { ...self.state.admin, ...newState }})
    })
  }

  /**
   * Toggle Admin
   */

  toggleAdmin() {
    let newState = { admin: !this.state.visible.admin }
    this.setState({ visible: { ...this.state.visible, ...newState }})
  }

  /**
   * Set Status
   */

  setStatus(status) {
    const self = this
    clearTimeout(this.timeout)
    this.setState({ admin: { ...this.state.admin, ...{ status }}})
    this.timeout = setTimeout(() =>{
      self.setState({ admin: { ...this.state.admin, ...{ status: `Ready for testing!` }}})
    }, 6000)
  }

  /**
   * Submit Form
   */

  submitForm(event) {

    event.preventDefault()

    const self = this
    const name = this.refFormName.current.value
    const email = this.refFormEmail.current.value

    if (!name || name === '' || !email || email === '') {
      alert('Form fields must be filled in')
      return
    }

    const callApi = () => {
      return fetch(this.state.admin.url, {
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
      self.setState({ visible: { ...this.state.visible, ...{ success: true }}})
    })
  }

  /**
   * Update API
   */

  updateApi(event) {

    event.preventDefault()

    const self = this
    let url = this.refInputUrl.current.value
    url = url.trim() || null

    function validURL(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return !!pattern.test(str);
    }

    if (!validURL(url)) {
      alert(`This is not a valid URL: ${url || '(Field is blank)'}`)
      return
    }

    const newState = { url: url }
    this.setState({
      admin: { ...this.state.admin, ...newState }
    }, () => {
      localStorage.setItem('demoapp', JSON.stringify({ url }))
      self.setStatus('API URL successfully updated!')
    })
  }

  /**
   * Generate Invocations
   */

  generateInvocations(event) {

    event.preventDefault()

    const self = this

    let invocations = this.refInputInvocations.current.value || this.state.admin.invocations
    invocations = parseInt(invocations) || 0

    if (invocations > 999) {
      //eslint-disable-next-line
      const r = confirm(`\nThis will generate ${invocations} API requests.  Are you sure you want to do this?\n`)
      if (!r) return
    }

    // Call API Function
    const callApi = () => {
      return fetch(this.state.admin.url, {
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
        self.setStatus(`Performing API request ${item}/${invocations}...`)
      }
      if (cb) return cb()
    }

    runner(() => {
      self.setStatus(`Successfully completed ${invocations} requests!`)
    })
  }

  /**
   * Generate Random Error
   */

  generateRandomError(event) {

    event.preventDefault()

    const self = this

    // Call API Function
    const callApi = () => {
      return fetch(`${this.state.admin.url}?error=true`, {
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
      self.setStatus(`Generating a random function error...`)
      if (cb) return cb()
    }

    runner(() => {
      self.setStatus(`Successfully generated a random function error!`)
    })
  }

  /*
  * Render
  */

  render() {

    return (
      <div className='DemoApp'>

        {
          /*
           * DemoApp Admin Menu
          */
        }

        <section className={`DemoApp-admin ${this.state.visible.admin ? `visible` : ``}`}>

          <div
            className='admin-close'
            onClick={this.toggleAdmin}>
            x
          </div>

          <div className='admin-logo'>
            <img src={logo} alt="logo" />
            Serverless Framework Enterprise - Demo Utilities
          </div>

          <div className='admin-section'
            style={{ display: `${ this.state.admin.status ? 'flex' : 'none' }`}}>
            <div className='admin-label'>
              Status
            </div>
            <p className='admin-status'>
              {this.state.admin.status}
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
                placeholder={this.state.admin.url || 'Enter the formSubmit API URL here...'}
                ref={this.refInputUrl}
              />
              <input
                type='submit'
                className='admin-button'
                value='Set'
                onClick={this.updateApi}
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
                placeholder={this.state.admin.invocations}
                ref={this.refInputInvocations}
              />
              <input
                type='submit'
                className='admin-button'
                value='Generate'
                onClick={this.generateInvocations}
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
                  onClick={this.generateRandomError}>Generate</div>
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

          <div className="admin-link animated fadeIn" onClick={this.toggleAdmin}>
            Demo Utilities
          </div>

          <div className='container animated zoomIn'>

            <div className='form-header' style={{ display: `${ this.state.visible.success ? 'none': 'flex' }`}}>
              Serverless Email Sign-Up Form
            </div>

            <form className='form' style={{ display: `${ this.state.visible.success ? 'none': 'flex' }`}}>
              <div className='form-field-label'>
                Full Name
              </div>
              <input
                type='text'
                className='form-field-input'
                placeholder='Allison Bensely'
                ref={this.refFormName}>
              </input>
              <div className='form-field-label'>
                Email
              </div>
              <input
                type='email'
                className='form-field-input'
                placeholder='allison.bensely@gmail.com'
                ref={this.refFormEmail}>
              </input>
              <div className='form-field-button-container'>
                <input type='submit' className='form-field-button' onClick={this.submitForm}></input>
              </div>
            </form>

            <div className='success animated fadeInUp' style={{ display: `${ this.state.visible.success ? 'flex': 'none' }`}}>
              Thank you for your submission!
            </div>

          </div>

        </section>
      </div>
    )
  }
}

export default DemoApp
