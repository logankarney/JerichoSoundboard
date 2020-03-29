import React, { Component } from 'react';
const { ipcRenderer } = window.require('electron');

class Sound extends Component {


    constructor(props) {
        super(props);
        this.state = {
            name: this.props.name,
            filepath: '',
            fileAddHandler: this.props.fileAddHandler
        }

    }

    render() {
        return (<div>
            <button onClick={() => this.addSound()}>Add</button>
            <button onClick={() => this.playSound()}>Play</button>
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
        if (this.state.filepath.localeCompare('') !== 0) {
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