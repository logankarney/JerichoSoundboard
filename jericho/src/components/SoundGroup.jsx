import React, { Component } from 'react';
import Sound from './Sound.jsx';

class SoundGroup extends Component {
    constructor(props) {
        super(props);

        let propSounds = this.props.sounds;

        this.state = {
            name: props.name,
            index: this.props.index,
            binding: this.props.binding,
            sounds: (propSounds !== undefined) ? propSounds : [],
            fileAddHandler: this.props.fileAddHandler
        }
    }

    render() {
        //TODO: generate this later
        return (<div><div>{this.state.name}<button onClick={() => this.addSound()}>Add</button></div>
            {
                this.state.sounds.map((sound, index) =>
                    <Sound name={this.state.index + ":" + index} key={this.state.index + ":" + index} fileAddHandler={this.props.fileAddHandler} />
                )
            }
        </div>
        );
    }

    addSound() {
        this.setState({ sounds: [...this.state.sounds, { name: this.state.index + ":" + this.state.sounds.length }] });

    }

    updateFormData(ev) {
        if (ev.target.type === "number") {
            this.setState({ [ev.target.name]: Number(ev.target.value) });
        } else {
            this.setState({ [ev.target.name]: ev.target.value });
        }
    }
}

export default SoundGroup;