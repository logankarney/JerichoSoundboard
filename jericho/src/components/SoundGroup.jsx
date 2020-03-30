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
                Object.keys(this.state.sounds).filter((sound, index) => { return this.state.sounds[index] !== undefined }).map((sound, index) => {
                    return <Sound name={this.state.index + ":" + index} key={this.state.index + ":" + index} fileAddHandler={this.props.fileAddHandler} filepath={this.state.sounds[index]} />
                }

                )
            }
        </div>
        );
        //return (<div>{this.state.name}</div>)
    }

    addSound() {
        let sounds = this.state.sounds;
        sounds[sounds.length] = '';
        //this.setState({ sounds: [...this.state.sounds, { name: this.state.index + ":" + this.state.sounds.length }] });
        this.setState({ sounds: sounds })

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