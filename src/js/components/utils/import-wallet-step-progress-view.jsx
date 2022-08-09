import React from 'react';
import PropTypes from 'prop-types';
import {useStepProgress, StepProgress, StepProgressBar, Step} from 'react-stepz';
import 'react-stepz/dist/index.css';
import Translation from '../../common/translation';

const ImportWalletStepProgressView = (props) => {
    const {stepForward, stepBackwards, getProps} = useStepProgress({
        steps: [
            {
                label: Translation.getPhrase('3b8d53026'),
                subtitle: '25%',
                name: 'wallet recover phrase'
            },
            {
                label: Translation.getPhrase('3a799ff26'),
                subtitle: '50%',
                name: 'wallet password'
            },
            {
                label: Translation.getPhrase('d25a4a6e4'),
                subtitle: '100%',
                name: 'finish'
            }
        ],
        startingStep: 0,
    });

    props.stepBackwards(stepBackwards);
    props.stepForward(stepForward);

    return (
        <StepProgress {...getProps}>
            <StepProgressBar />
            <Step step={1}>
            </Step>
            <Step step={2}>
            </Step>
            <Step step={3}>
            </Step>
        </StepProgress>
    );
};

ImportWalletStepProgressView.propTypes = {
    stepForward: PropTypes.func.isRequired,
    stepBackwards: PropTypes.func.isRequired
};


export default ImportWalletStepProgressView;
