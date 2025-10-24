import React from 'react'
import { Link } from 'react-router-dom'
import RegistrationStepper from '../../components/RegistrationStepper/RegistrationStepper'
import './RegistrationPage.css'

const RegistrationPage = () => {
  return (
    <div className='registration-page-container'>
      <Link to="/" className='btn-volver'>← Volver</Link>
      <div className='registration-content-container'>
        <div className='registration-logo-container'>
          <img src="/completeLogo.png" alt="Logo" />
        </div>
        <div className='registration-form-container'>
          <RegistrationStepper />
        </div>
      </div>
    </div>
  )
}

export default RegistrationPage
