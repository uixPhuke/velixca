import React from 'react'
import Header from './components/Header/Header'
import Hero from './pages/Hero/Hero'
import Footer from './components/Footer/Footer'

const App = () => {
  return (
    <div className='min-h-screen bg-gray-500'>
      <Header/>
      <Hero/>
      <Footer/>
    </div>
  )
}

export default App
