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

        let propSoundGroups = this.props.soundGroups;


        this.state = {
            name: "Test Name",
            soundGroups: (propSoundGroups !== undefined) ? propSoundGroups : [],
        }

        ipcRenderer.on('binding', (event, binding) => {
            console.log(binding)
            this.playSoundGroup(binding);
        });
    }

    render() {

        this.soundboard = (
            <div>

                <Button id="addGroupButton" className="bp3-button bp3-icon-add bp3-intent-primary" onClick={() => this.addSoundGroup()} >Add Group</Button>;

                <div id="soundGroups">
                    {
                        this.state.soundGroups.map((group, index) => <SoundGroup key={index} index={index.toString()} name={group.name} binding={group.binding} sounds={group.sounds} fileAddHandler={this.addFileHander.bind(this)} />)
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
        this.setState({ soundGroups: [...this.state.soundGroups, { name: "Group " + this.state.soundGroups.length, binding: this.state.soundGroups.length.toString() }] });
    }

    playSoundGroup(binding) {
        for (let i = 0; i < this.state.soundGroups.length; i++) {
            let group = this.state.soundGroups[i];
            if (group.binding.localeCompare(binding) === 0) {
                let sounds = group.sounds;
                let random = Math.round(Math.random() * Object.keys(sounds).length);
                this.playSound(sounds[random]);
            }

        }
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

    addFileHander(fileInput) {

        let groupFile = fileInput.id.split(':');
        let groupId = groupFile[0];
        let fileId = groupFile[1];
        let filepath = fileInput.filepath;

        //Gets the list of Sounds from the appropriate group
        let groups = this.state.soundGroups;
        let group = groups[groupId];
        let groupSounds = { ...group.sounds }

        //Set the filepath of the new sound
        groupSounds[fileId] = filepath
        group.sounds = groupSounds
        groups[groupId] = group;
        this.setState({ soundGroups: groups });
    }

    updateFormData(ev) {
        if (ev.target.type === "number") {
            this.setState({ [ev.target.name]: Number(ev.target.value) });
        } else {
            this.setState({ [ev.target.name]: ev.target.value });
        }
    }

    playSound(filepath) {
        if (filepath !== undefined && filepath.localeCompare('') !== 0) {
            const player = new Audio(filepath);
            player.play().catch(e => console.error("audio play failed with: " + e));
        }
    }

}

export default SoundBoard;