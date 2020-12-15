import React, { Component } from 'react';
import './App.css';
import Navigation from './Components/Navigation/Navigation'
import Logo from './Components/Logo/Logo'
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
import Rank from './Components/Rank/Rank'
import FaceRecognition from './Components/FaceRecognition/FaceRecognition'
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';


const faceDetect = new Clarifai.App({
  apiKey: 'ff14243b7b7c4f3a9881939a8a93de6a'
})

const particlesOptions = {
  particles: {
    line_linked: {
      shadow: {
        enable: true,
        color: "#3CA9D1",
        blur: 5
      }
    },
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box: {},
    }
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height)
    return {
      leftCol: clarifaiFace.left_col*width,
      topRow: clarifaiFace.top_row*height,
      rightCol: width-(clarifaiFace.right_col*width),
      bottomRow: height - (clarifaiFace.bottom_row *height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box}, ()=>{console.log(this.state.box)});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value}, ()=>{console.log(this.state.input)})
  }

  onButtonSubmit = () => {
    console.log('click')
    this.setState({imageURL:this.state.input})
    faceDetect.models.predict(Clarifai.FACE_DETECT_MODEL, `${this.state.input}`, { maxConcepts: 3 })
      .then(response => {
        console.log(response.outputs[0].data.regions[0].region_info.bounding_box)
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(error => { console.log(error)
      });
  }

  render() {
    return (
      <div className = "App">
        <Particles className = 'particles' params={particlesOptions}/>
        <Navigation/>
        <Logo/>
        <Rank/>
        <ImageLinkForm 
          onInputChange = {this.onInputChange}
          onButtonSubmit = {this.onButtonSubmit}/>
        <FaceRecognition box={this.state.box} imageURL={this.state.imageURL}/>
      </div>
    )
  }
}

export default App;
