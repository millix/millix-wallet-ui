import React from 'react';
import PropTypes from 'prop-types';
import {useStepProgress, StepProgress, StepProgressBar, Step} from 'react-stepz';
import 'react-stepz/dist/index.css';
import Translation from '../../common/translation';

const NewWalletStepProgressView = (props) => {
    const {
              stepForward,
              stepBackwards,
              getProps
          } = useStepProgress({
        steps       : [
            {
                label   : Translation.getPhrase('19549eb8b'),
                subtitle: '10%',
                name    : 'wallet password'
            },
            {
                label   : Translation.getPhrase('5a3cfab35'),
                subtitle: '25%',
                name    : 'wallet recover phrase'
            },
            {
                label   : Translation.getPhrase('cb0ddad0e'),
                subtitle: '50%',
                name    : 'confirm recover phrase'
            },
            {
                label   : Translation.getPhrase('5e8182fbe'),
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
