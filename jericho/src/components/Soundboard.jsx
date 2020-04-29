import React, { Component } from 'react';
import SoundGroup from './SoundGroup.jsx'
import { Button } from "@blueprintjs/core";
import "normalize.css/normalize.css"
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "../css/main.css"
const { ipcRenderer } = window.require('electron');


const cleanState = () => ({
    name: "Group Name",
    soundGroups: []
});


class SoundBoard extends Component {


    constructor(props) {
        super(props);

        this.state = {
            name: "Test Name",
            soundGroups: [],
        }

        ipcRenderer.on('binding', (event, binding) => {
            this.playSoundGroup(binding);
        });
    }

    render() {

        this.soundboard = (
            <div>

                <Button id="addGroupButton" className="bp3-button bp3-icon-add bp3-intent-primary" onClick={() => this.addSoundGroup()} >Add Group</Button>;

                <div id="soundGroups">
                    {
                        this.state.soundGroups.map((group, index) => <SoundGroup key={index} index={index.toString()} name={group.name} binding={group.binding} sounds={group.sounds} soundAddHandler={this.addSoundHandler.bind(this)} fileAddHandler={this.addFileHander.bind(this)} />)
                    }
                </div>
                <div>
                    <Button className="bp3-button bp3-icon-download bp3-intent-secondary" onClick={() => this.import()} >Import</Button>
                    <Button className="bp3-button bp3-icon-upload bp3-intent-secondary" onClick={() => this.export()} >Export</Button>
                </div>

            </div>
        );




        return this.soundboard;
    }

    addSoundGroup() {
        let soundGroupLength = this.state.soundGroups.length;
        let newGroup = { name: "Group " + soundGroupLength, binding: soundGroupLength.toString(), sounds: [] }
        const soundGroups = this.state.soundGroups.slice();
        soundGroups.push({ ...newGroup });
        this.setState({ soundGroups: soundGroups });
    }

    import() {

        this.setState(cleanState);

        ipcRenderer.send('import');

        ipcRenderer.on('load', (event, file) => {
            this.setState({ name: file.name })
            this.setState({ soundGroups: file.soundGroups })
        });
    }

    export() {
        //TODO: use toast here to send message on success/failure
        let storedData = JSON.stringify(this.state)
        ipcRenderer.send('export', storedData);
    }


    //Adds a sound to the specified group
    addSoundHandler(groupIndex) {
        const soundGroups = this.state.soundGroups.slice();
        let group = soundGroups[groupIndex];
        //this.state.index + ":" + index;
        let soundsLength = group.sounds.length;
        group.sounds.push({ name: groupIndex + ":" + soundsLength, filepath: "", displayName: "Sound " + soundsLength })
        this.setState({ soundGroups: soundGroups });
    }

    addFileHander(fileInput) {

        let groupFile = fileInput.id.split(':');
        let groupId = groupFile[0];
        let fileId = groupFile[1];
        let filepath = fileInput.filepath;

        //Gets the list of Sounds from the appropriate group
        let soundGroups = this.state.soundGroups.slice();
        soundGroups[groupId].sounds[fileId].filepath = filepath;
        this.setState({ soundGroups: soundGroups });
    }

    playSoundGroup(binding) {

        let group = this.state.soundGroups[binding];

        if (group !== undefined) {
            let sounds = group.sounds;

            let playableSounds = [];

            sounds.forEach(sound => {
                if (sound.filepath !== undefined && sound.filepath.localeCompare("") !== 0) {
                    playableSounds.push(sound);
                }
            });


            let random = Math.round(Math.random() * (Object.keys(playableSounds).length - 1));
            this.playSound(playableSounds[random].filepath);
        }

    }

    playSound(filepath) {
        if (filepath !== undefined && filepath.localeCompare('') !== 0) {
            const player = new Audio(filepath);
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

export default SoundBoard;