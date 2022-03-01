import React from "react";
import { loaderStatus } from "./utils/loader-status";
import { Oval } from  'react-loader-spinner'

const LoadingContainer = props => {
  return (

    <div className="loader-container">
      <div className="loader">
        <div className="circle">         
        </div>
      </div>
    </div>

    /*<div className="loader-container">
      <div className="loader">
        <Oval color="#9400ce" height={80} width={80} />
      </div>
    </div>*/
    
  );
};

class Loader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingStatus: false //Loading state for component
    };
  }

  componentWillMount() {
    // Subscribe to loaderStatus to detect the changes emitted by the any other component
    // If true then it will turn on the loader
    // if false then it will turn off the loader
    loaderStatus.subscribe(result => {
      this.setState({ loadingStatus: result ? true : false });
    });
  }

  // Checking if loadingStatus is true the return the LoadingContainer
  // Else return null
  render() {
    const { loadingStatus } = this.state;
    return loadingStatus ? <LoadingContainer /> : null;
  }
}

export default Loader;