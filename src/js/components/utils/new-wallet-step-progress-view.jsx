import React from 'react';
import PropTypes from 'prop-types';
import {Step, StepProgress, StepProgressBar, useStepProgress} from 'react-stepz';
import 'react-stepz/dist/index.css';

const NewWalletStepProgressView = (props) => {
    const {
              stepForward,
              stepBackwards,
              getProps
          } = useStepProgress({
        steps       : [
            {
                label   : 'wallet password',
                subtitle: '10%',
                name    : 'wallet password'
            },
            {
                label   : 'wallet recover phrase',
                subtitle: '25%',
                name    : 'wallet recover phrase'
            },
            {
                label   : 'confirm recover phrase',
                subtitle: '50%',
                name    : 'confirm recover phrase'
            },
            {
                label   : 'finish',
                subtitle: '100%',
                name    : 'finish'
            }
        ],
        startingStep: 0
    });

    props.stepBackwards(stepBackwards);
    props.stepForward(stepForward);

    return (
        <StepProgress {...getProps}>
            <StepProgressBar/>
            <Step step={1}>
            </Step>
            <Step step={2}>
            </Step>
            <Step step={3}>
            </Step>
            <Step step={4}>
            </Step>
        </StepProgress>
    );
};

NewWalletStepProgressView.propTypes = {
    stepForward  : PropTypes.func.isRequired,
    stepBackwards: PropTypes.func.isRequired
};


export default NewWalletStepProgressView;
