import React, { Component } from 'react';
import SoundGroup from './SoundGroup.jsx'
import { Button, Overlay, InputGroup, Collapse } from "@blueprintjs/core";
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
            tableSoundGroups: [],
            editMode: false
        }

        ipcRenderer.on('binding', (event, binding) => {
            this.playSoundGroup(binding);
        });


    }

    render() {

        return (
            <div>
                <Overlay isOpen={this.state.editMode} autoFocus={true} enforceFocus={true} canOutsideClickClose={false} canEscapeKeyClose={true} onClose={() => this.toggleOverlay()} transitionDuration={0}>
                    <div id="overlay-children">
                        <table id="data-table" className="bp3-html-table">
                            <thead>
                                <tr>
                                    <th>Group Name</th>
                                    <th>Binding</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>

                                {
                                    this.state.tableSoundGroups.map((group, index) =>

                                        ([<tr key={index}>
                                            <td><InputGroup value={group.name} name="name" onChange={(e) => this.editTableCell(e, index)} /></td>
                                            <td><InputGroup value={group.binding} name="binding" onChange={(e) => this.editTableCell(e, index)} /></td>
                                            <td><Button className="bp3-button bp3-icon-add bp3-intent-danger bp3-icon-trash" onClick={() => this.deleteSoundGroup(index)} /></td>
                                        </tr>,
                                        <tr key={index + "-sounds"} >
                                            <td colSpan={3}>
                                                <div>
                                                    {group.sounds.length} Sounds
                                                </div>
                                                <div>
                                                    <Collapse isOpen={true}>
                                                        <table className={"table-sounds"}>
                                                            <tbody>
                                                                {
                                                                    group.sounds.map((sound, index) => {
                                                                        return <tr key={index}>
                                                                            <td>
                                                                                <InputGroup value={sound.displayName} />
                                                                            </td>
                                                                            <td>
                                                                                soundFileNameTruncated
                                                                            </td>
                                                                            <td>
                                                                                <Button>Edit File</Button>
                                                                            </td>
                                                                            <td>
                                                                                <Button>Delete</Button>
                                                                            </td>
                                                                        </tr>
                                                                    })
                                                                }
                                                            </tbody>
                                                        </table>

                                                    </Collapse>
                                                </div>

                                            </td>
                                        </tr>])
                                    )
                                }
                            </tbody>
                        </table>

                        <div>
                            <Button className="bp3-button bp3-intent-warning" onClick={() => this.closeOverlay(false)}>Cancel</Button>
                            <Button className="bp3-button bp3-intent-success" onClick={() => this.closeOverlay(true)}>Done</Button>
                        </div>
                    </div>


                </Overlay>
                <Button id="addGroupButton" className="bp3-button bp3-icon-add bp3-intent-primary" onClick={() => this.addSoundGroup()} >Add Group</Button>;
                <Button id="settingsButton" className="bp3-button bp3-icon-settings" onClick={() => this.openOverlay()} />

                <div id="soundGroups">
                    {
                        this.state.soundGroups.map((group, index) => <SoundGroup key={index} index={index.toString()} name={group.name} sounds={group.sounds} soundAddHandler={this.addSoundHandler.bind(this)} fileAddHandler={this.addFileHander.bind(this)} />)
                    }
                </div>
                <div>
                    <Button className="bp3-button bp3-icon-download bp3-intent-secondary" onClick={() => this.import()} >Import</Button>
                    <Button className="bp3-button bp3-icon-floppy-disk bp3-intent-secondary" onClick={() => this.export()} >Save</Button>
                </div>

            </div>
        );

    }

    editTableCell(e, index) {
        let groupId = index;
        let type = e.target.name;
        let tableSoundGroups = this.state.tableSoundGroups.slice();
        tableSoundGroups[groupId][type] = e.target.value;
        this.setState({ tableSoundGroups: tableSoundGroups });
    }

    deleteSoundGroup(index) {

        const tableSoundGroups = this.state.tableSoundGroups.slice().filter((group, i) => {
            return i !== index;
        });


        this.setState({ tableSoundGroups: tableSoundGroups });
    }

    addSoundGroup() {
        let soundGroupLength = this.state.soundGroups.length;
        let newGroup = { name: "Group " + soundGroupLength, binding: soundGroupLength.toString(), sounds: [] }
        const soundGroups = this.state.soundGroups.slice();
        soundGroups.push({ ...newGroup });
        this.setState({ soundGroups: soundGroups });
    }

    openOverlay() {
        if (this.state.soundGroups.length > 0) {
            //Deep copies soundGroups so if any changes are reverted, the original is untouched on overlay close
            this.setState({ tableSoundGroups: JSON.parse(JSON.stringify(this.state.soundGroups)) }, this.toggleOverlay());
        }
    }

    closeOverlay(save) {
        //TODO: add handlers to editing tableSoundGroups to save data

        if (save) {
            this.setState({ soundGroups: JSON.parse(JSON.stringify(this.state.tableSoundGroups)) });
        }

        this.toggleOverlay();
    }

    toggleOverlay() {
        this.setState({ editMode: !this.state.editMode });
    }

    import() {

        //TODO: Check if a file was chosen before wiping data
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

        //let group = this.state.soundGroups[binding];
        let group = this.state.soundGroups.find(soundGroup => soundGroup.binding.localeCompare(binding) === 0);

        if (group !== undefined) {
            let sounds = group.sounds;

            let playableSounds = [];

            sounds.forEach(sound => {
                if (sound.filepath !== undefined && sound.filepath.localeCompare("") !== 0) {
                    playableSounds.push(sound);
                }
            });


            let random = Math.round(Math.random() * (Object.keys(playableSounds).length - 1));

            //If the soundboard has any valid sounds
            if (playableSounds[random] !== undefined) {
                this.playSound(playableSounds[random].filepath);
            }

        }

    }

    playSound(filepath) {
        if (filepath !== undefined && filepath.localeCompare('') !== 0) {
            const player = new Audio(filepath);
            player.play().catch(e => console.error("audio play failed with: " + e));
        }
    }

    editGroupNameHandler(groupIndex, newName) {
        const soundGroups = this.state.soundGroups.slice();
        let group = soundGroups[groupIndex];
        group.name = newName;

        this.setState({ soundGroups: soundGroups });
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