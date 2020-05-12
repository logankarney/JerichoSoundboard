import React, { Component } from 'react';
import { Button, InputGroup, Collapse } from "@blueprintjs/core";
import "normalize.css/normalize.css"
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "../css/main.css"
const { ipcRenderer } = window.require('electron');


const cleanState = () => ({
    soundGroups: [],
    tableSoundGroups: [],
    activeSounds: []
});


class SoundBoard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            soundGroups: [],
            tableSoundGroups: [],
            activeSounds: []
        }

        ipcRenderer.on('binding', (event, binding) => {
            this.playSoundGroup(binding);
        });

        ipcRenderer.on('stop', event => {
            this.stopSounds();
        })
    }

    render() {

        return (
            <div id="grid">
                <p id="grid-top">Jericho</p>

                <div id="grid-center">
                    <div>
                        <table id="group-table" className="bp3-html-table">
                            <thead id="group-table-head">
                                <tr className="no-select">
                                    <th>Group Name</th>
                                    <th>Binding</th>
                                    <th>Add Sound</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody id="group-table-body">

                                {
                                    this.state.tableSoundGroups.map((group, i) =>

                                        ([<tr key={i}>
                                            <td><InputGroup value={group.name} name="name" onChange={(e) => this.editGroupTableCell(e, i)} /></td>
                                            <td><InputGroup value={group.binding} name="binding" onChange={(e) => this.editGroupTableCell(e, i)} /></td>
                                            <td><Button className="bp3-button bp3-icon-add" onClick={() => this.addSound(i)}></Button></td>
                                            <td><Button className="bp3-button bp3-icon-add bp3-intent-danger bp3-icon-trash" onClick={() => this.deleteSoundGroup(i)} /></td>
                                        </tr>,
                                        <tr key={i + "-sounds"}>
                                            <td colSpan={4}>
                                                <div onClick={() => this.toggleSoundsDropdown(i)} className="no-select">
                                                    {group.sounds.length} Sound{group.sounds.length !== 1 ? "s" : ""}
                                                </div>
                                                <div>
                                                    <Collapse isOpen={group.open} className="sound-dropdown">
                                                        <table className="table-sounds bp3-elevation-3">
                                                            <tbody>
                                                                {
                                                                    group.sounds.map((sound, j) => {
                                                                        return <tr key={j}>
                                                                            <td>
                                                                                <InputGroup value={sound.displayName} onChange={(e) => this.editSoundTableCell(e, i, j)} />
                                                                            </td>

                                                                            <td>
                                                                                <Button className={`bp3-icon-${this.state.tableSoundGroups[i].sounds[j].filepath.localeCompare('') !== 0 ? "selection" : "circle"}`}
                                                                                    onClick={() => this.editSoundFile(i + ":" + j)} />
                                                                            </td>
                                                                            <td>
                                                                                <Button className="bp3-icon-play" onClick={() => this.playSoundCell(i, j)} />
                                                                            </td>
                                                                            <td>
                                                                                <Button className="bp3-icon-trash" onClick={() => this.deleteSoundTableCell(i, j)} />
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
                    </div>

                </div>

                <div id="grid-left">
                    <Button id="addGroupButton" className="bp3-button bp3-icon-add bp3-intent-primary" onClick={() => this.addSoundGroup()} />
                    <hr />
                    <Button className="bp3-button bp3-icon-undo bp3-intent-warning" onClick={() => this.closeOverlay(false)} />
                    <Button className="bp3-button bp3-icon-floppy-disk bp3-intent-success" onClick={() => this.closeOverlay(true)} />
                    <hr />
                    <Button className="bp3-button bp3-icon-download bp3-intent-secondary" onClick={() => this.import()} />
                    <Button className="bp3-button bp3-icon-upload bp3-intent-secondary" onClick={() => this.export()} />
                    <hr />
                    <Button className="bp3-button bp3-icon-cog" />

                </div>

            </div>
        );

    }

    /***
     * Soundboard Methods
     */
    addSoundGroup() {
        let tableSoundGroupsLength = this.state.tableSoundGroups.length;
        let newGroup = { name: "Group " + tableSoundGroupsLength, binding: "", sounds: [], open: false }
        const soundGroups = this.state.tableSoundGroups.slice();
        soundGroups.push({ ...newGroup });
        this.setState({ tableSoundGroups: soundGroups });
    }

    closeOverlay(save) {
        //TODO: add handlers to editing tableSoundGroups to save data

        if (save) {
            this.setState({ soundGroups: JSON.parse(JSON.stringify(this.state.tableSoundGroups)) });
        } else {
            this.setState({ tableSoundGroups: JSON.parse(JSON.stringify(this.state.soundGroups)) });
        }


    }

    import() {

        this.setState(cleanState);

        ipcRenderer.send('import');

        ipcRenderer.on('load', (event, file) => {
            this.setState({ tableSoundGroups: file.soundGroups })
        });
    }

    export() {
        //TODO: use toast here to send message on success/failure

        let exports = {
            soundGroups: this.state.tableSoundGroups
        }

        let storedData = JSON.stringify(exports)
        ipcRenderer.send('export', storedData);
    }

    playSoundGroup(binding) {

        //let group = this.state.soundGroups[binding];

        if (binding.localeCompare("") === 0) {
            return;
        }

        let group = this.state.tableSoundGroups.find(soundGroup => soundGroup.binding.localeCompare(binding) === 0);

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

    stopSounds() {
        let activeSounds = this.state.activeSounds.slice();
        while (activeSounds.length !== 0) {
            let player = activeSounds.pop();
            player.pause();
            player.currentTime = 0;
        }
        this.setState({ activeSounds: activeSounds });
    }

    /***
     * SoundGroup Methods
     */
    editGroupTableCell(e, i) {
        let type = e.target.name;
        let tableSoundGroups = this.state.tableSoundGroups.slice();
        tableSoundGroups[i][type] = e.target.value;
        this.setState({ tableSoundGroups: tableSoundGroups });
    }

    deleteSoundGroup(index) {

        const tableSoundGroups = this.state.tableSoundGroups.slice().filter((group, i) => {
            return i !== index;
        });


        this.setState({ tableSoundGroups: tableSoundGroups });
    }

    addSound(groupIndex) {
        const tableSoundGroups = this.state.tableSoundGroups.slice();
        let group = tableSoundGroups[groupIndex];
        let soundsLength = group.sounds.length;
        group.sounds.push({ name: groupIndex + ":" + soundsLength, filepath: "", displayName: "Sound " + soundsLength })
        group.open = true;
        this.setState({ tableSoundGroups: tableSoundGroups });
    }

    toggleSoundsDropdown(i) {
        const tableSoundGroups = this.state.tableSoundGroups.slice();
        tableSoundGroups[i].open = !tableSoundGroups[i].open;
        this.setState({ tableSoundGroups: tableSoundGroups });
    }

    /***
     * Sound Methods
     */
    editSoundTableCell(e, i, j) {
        let tableSoundGroups = this.state.tableSoundGroups.slice();
        tableSoundGroups[i].sounds[j].displayName = e.target.value;
        this.setState({ tableSoundGroups: tableSoundGroups });
    }

    deleteSoundTableCell(i, j) {

        const tableSoundGroups = this.state.tableSoundGroups.slice();
        let soundGroup = tableSoundGroups[i];

        soundGroup.sounds = soundGroup.sounds.filter((sound, index) => {
            return index !== j;
        });


        this.setState({ tableSoundGroups: tableSoundGroups });

    }


    editSoundFile(id) {
        //tells electron to open a file dialog for audio files

        let args = {
            id: id
        }

        ipcRenderer.send('add', args);

        //sets the component's filepath
        ipcRenderer.on('filepath' + id, (event, filepath) => {
            this.editFilepathHander({ id: id, filepath: filepath });
        });
    }

    editFilepathHander(fileInput) {

        let groupFile = fileInput.id.split(':');
        let groupId = groupFile[0];
        let fileId = groupFile[1];
        let filepath = fileInput.filepath;

        //Gets the list of Sounds from the appropriate group
        let soundGroups = this.state.tableSoundGroups.slice();
        soundGroups[groupId].sounds[fileId].filepath = filepath;
        this.setState({ tableSoundGroups: soundGroups });
    }

    playSoundCell(i, j) {
        this.playSound(this.state.tableSoundGroups[i].sounds[j].filepath);
    }

    /***
     * Misc Methods
     */
    async playSound(filepath) {
        if (filepath !== undefined && filepath.localeCompare('') !== 0) {
            const player = new Audio(filepath);

            player.play().catch(e => console.error("audio play failed with: " + e));

            player['onended'] = () => {
                let activeSounds = this.state.activeSounds.slice().filter((sound, i) => {
                    return sound !== player;
                });

                this.setState({ activeSounds: activeSounds });
            };

            let activeSounds = this.state.activeSounds.slice();
            activeSounds.push(player);
            this.setState({ activeSounds: activeSounds });
        }
    }

}

export default SoundBoard;