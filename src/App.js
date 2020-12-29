import React, { Component } from 'react';
// CSS styling across the entire app
import './App.css';
// Invidual components
import Navigation from './Components/Navigation/Navigation'
import Logo from './Components/Logo/Logo'
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
import Rank from './Components/Rank/Rank'
import FaceRecognition from './Components/FaceRecognition/FaceRecognition'
import Signin from './Components/Signin/Signin'
import Register from './Components/Register/Register'
// Other packages used
import Particles from 'react-particles-js';




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


const initialState = {
  input: '',
      imageURL: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageURL: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
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
    fetch('http://localhost:3001/imageurl', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
          input: this.state.input,
          // entries: this.state.user.entries++
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('http://localhost:3001/image', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id,
                // entries: this.state.user.entries++
          })
        })
        .then(response=>response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
          // this.setState({user: {entries: count}})
        })
        .catch(console.log)
      }
        console.log(response.outputs[0].data.regions[0].region_info.bounding_box)
        this.displayFaceBox(this.calculateFaceLocation(response))
      })

      .catch(error => { console.log(error)
      });
  }

  onRouteChange = (route) => {
    if(route === 'signin') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    
    this.setState({route: route})
    
    // { this.state.route === 'home' ? this.setState({route: 'signin'}) : this.setState({route: 'home'})}
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  render() {
    return (
      <div className = "App">
        <Particles className = 'particles' params={particlesOptions}/>
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn} user={this.state.user}/>

        { this.state.route === 'home' 
          ? <div> 
              <Logo/>
              <Rank user={this.state.user}/>
              <ImageLinkForm 
                onInputChange = {this.onInputChange}
                onButtonSubmit = {this.onButtonSubmit}/>
              <FaceRecognition box={this.state.box} imageURL={this.state.imageURL}/>
            </div> 
          
          
          : (
            this.state.route === 'signin'
            ? <Signin  loadUser = {this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register onRouteChange={this.onRouteChange} loadUser = {this.loadUser}/>
          )
      }

        
      </div>
    )
  }
}

export default App;
