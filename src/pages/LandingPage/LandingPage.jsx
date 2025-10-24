import React from 'react';
import ElementCard from '../../components/ElementCard/ElementCard.jsx';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <>
      <header>
        <div>
          <h1>PARANORMAL</h1>
          <img src="/ghost.webp" alt="" />
        </div>
      </header>
      <main>
        <section className='website-description-section' id='section-config'>
          <div className='description-text-container'>
            <h2>RECOPILACIÓN DE CASOS</h2>
            <p>spectra es una plataforma centralizada de casos paranormales de todo ámbito. fantasmas, parapsicología, ufología, criptozoología y misterios.</p>
          </div>
          <div className='description-images-container'>
            <img src="/pt01.webp" alt=""  className='description-image01'/>
            <img src="/pt02.webp" alt="" className='description-image02'/>
          </div>
        </section>
        <section className='website-elements-section' id='section-config'>
          <h3>SUBE TUS CASOS Y EXPERIENCIAS</h3>
          <div className='elements-container'>
            <ElementCard />
          </div>
        </section>
        <section className='website-showcases' id='section-config'>

        </section>
      </main>
    </>
  );
};

export default LandingPage;
