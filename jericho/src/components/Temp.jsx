import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

const styles = {
    addGroup: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 48,
        padding: '0 30px',
    },
    root2: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 48,
        padding: '0 30px',
    },
};

function groupButton(props) {
    const { classes } = props;
    return <Button className={classes.addGroup} ><FontAwesomeIcon icon={faPlusCircle} id="groupAddButton" />Add Group</Button>;
}

function Temp(props) {
    const { classes } = props;
    return <Button className={classes.root2}>Higher-order component</Button>;
}

groupButton.propTypes = {
    classes: PropTypes.object.isRequired,
};

Temp.propTypes = {
    classes: PropTypes.object.isRequired,
};

//export { withStyles(styles)(Temp), Temp2 }
const GroupButton = withStyles(styles)(groupButton);
const Temp2B = withStyles(styles)(Temp);
export { GroupButton, Temp2B }