import React, { Component } from 'react';
import Sound from './Sound.jsx';
import { Button, Collapse, Icon } from "@blueprintjs/core";

class SoundGroup extends Component {
    constructor(props) {
        super(props);

        let propSounds = this.props.sounds;

        this.state = {
            name: props.name,
            index: this.props.index,
            binding: this.props.binding,
            isOpen: true,
            sounds: (propSounds !== undefined) ? propSounds : [],
            fileAddHandler: this.props.fileAddHandler
        }
    }

    render() {
        //TODO: generate this later
        return (
            <div>
                <div className="soundGroupHeader">
                    <Button onClick={() => this.toggleOpen()} minimal={true} className="chevron">
                        <Icon icon={this.state.isOpen && this.state.sounds.length > 0 ? "chevron-down" : "chevron-right"} iconSize={22} />
                    </Button>
                    <label className="soundGroupName">{this.state.name}</label>
                    <Button onClick={() => this.addSound()} minimal={true}><Icon icon="plus" iconSize={22} /></Button>
                </div>
                <div>
                    <Collapse isOpen={this.state.isOpen} keepChildrenMounted={true}> <div>
                    </div>
                        {
                            Object.keys(this.state.sounds).filter((sound, index) => { return this.state.sounds[index] !== undefined }).map((sound, index) => {
                                return <Sound name={this.state.index + ":" + index} key={this.state.index + ":" + index} fileAddHandler={this.props.fileAddHandler} filepath={this.state.sounds[index]} />
                            }

                            )
                        }</Collapse>

                </div>



            </div >
        );
    }

    addSound() {
        this.setState({ isOpen: true })

        let sounds = this.state.sounds;
        sounds[sounds.length] = '';
        //TODO: filter undefineds out
        this.setState({ sounds: sounds })

    }

    toggleOpen() {
        this.setState({ isOpen: !this.state.isOpen })
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