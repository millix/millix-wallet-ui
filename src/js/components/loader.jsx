import React from "react";
import { loaderStatus } from "./utils/loader-status";

const LoadingContainer = props => {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="circle">         
        </div>
      </div>
    </div>
    );
};

class Loader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingStatus: false
    };
  }

  componentWillMount() {
    loaderStatus.subscribe(result => {
      this.setState({ loadingStatus: result ? true : false });
    });
  }

  render() {
    const { loadingStatus } = this.state;
    return loadingStatus ? <LoadingContainer /> : null;
  }
}

export default Loader;
