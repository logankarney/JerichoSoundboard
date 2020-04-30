import React, { Component } from 'react';
import Sound from './Sound.jsx';
import { Button, Collapse, Icon, Label, InputGroup } from "@blueprintjs/core";

class SoundGroup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.name,
            index: this.props.index,
            binding: this.props.binding,
            isOpen: true,
            editingName: false,
            sounds: this.props.sounds,
            soundAddHandler: this.props.soundAddHandler,
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
                    {
                        !this.state.editingName && <Label className="soundGroupName" onContextMenu={() => this.toggleEdit()}>{this.state.name}</Label>
                    }
                    {
                        this.state.editingName && <InputGroup name="name" onContextMenu={() => this.toggleEdit()} value={this.state.name} onChange={(e) => { this.updateFormData(e) }} />
                    }

                    <Button className="addSoundButton" onClick={() => this.addSound()} minimal={true}><Icon icon="plus" iconSize={22} /></Button>
                </div>
                <div>
                    <Collapse isOpen={this.state.isOpen} keepChildrenMounted={true}>

                        {
                            this.state.sounds.map((sound, index) => {
                                return <Sound name={sound.name} key={this.state.index + ":" + index} index={index} fileAddHandler={this.props.fileAddHandler} filepath={sound.filepath} />
                            })
                        }

                    </Collapse>

                </div>



            </div >
        );
    }

    addSound() {
        this.setState({ isOpen: true })
        this.state.soundAddHandler(this.state.index);
    }

    toggleOpen() {
        this.setState({ isOpen: !this.state.isOpen })
    }

    toggleEdit() {
        this.setState({ editingName: !this.state.editingName })
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