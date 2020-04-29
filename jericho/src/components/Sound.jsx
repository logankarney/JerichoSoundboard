import React, { Component } from 'react';
import { Button, Icon, Label } from "@blueprintjs/core";
const { ipcRenderer } = window.require('electron');

class Sound extends Component {


    constructor(props) {
        super(props);
        this.state = {
            name: this.props.name,
            filepath: this.props.filepath,
            fileAddHandler: this.props.fileAddHandler,
            index: this.props.index,
            displayName: "Sound " + this.props.index
        }

    }

    render() {
        return (<div className="soundHeader">
            <Button onClick={() => this.addSound()} minimal={true} className="editButton"><Icon icon="edit" iconSize={16} /></Button>
            <Label className="soundName">{this.state.displayName}</Label>
            <Button onClick={() => this.playSound()} minimal={true} className="playButton"><Icon icon="play" iconSize={18} intent={this.state.filepath !== undefined && this.state.filepath !== '' ? "success" : "none"} /></Button>
        </div>);
    }

    addSound() {
        //tells electron to open a file dialog for audio files

        let args = {
            id: this.state.name
        }

        ipcRenderer.send('add', args);

        //sets the component's filepath
        ipcRenderer.on('filepath' + this.state.name, (event, filepath) => {
            this.setState({ filepath: filepath });
            this.state.fileAddHandler({ id: this.state.name, filepath: filepath });
        });
    }

    playSound() {
        //only play the audio file if one has been added
        if (this.state.filepath !== undefined && this.state.filepath.localeCompare('') !== 0) {
            const player = new Audio(this.state.filepath);
            player.play().catch(e => console.error("audio play failed with: " + e));
        }
    }

    updateFormData(ev) {
        if (ev.target.type === "number") {
            this.setState({ [ev.target.name]: Number(ev.target.value) });
        } else {
            this.setState({ [ev.target.name]: ev.target.value });
        }
    }

}

export default Sound;