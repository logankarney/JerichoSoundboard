import React, { Component } from 'react';
import SoundGroup from './SoundGroup.jsx'
const { ipcRenderer } = window.require('electron');


class SoundBoard extends Component {


    constructor(props) {
        super(props);

        let propSoundGroups = this.props.soundGroups;

        this.state = {
            soundGroups: (propSoundGroups !== undefined) ? propSoundGroups : []
        }

        ipcRenderer.on('binding', (event, binding) => {
            console.log(binding)
        });
    }

    render() {

        this.soundboard = (
            <div>
                <button onClick={() => this.addSoundGroup()}>Add Group</button>
                <div id="soundGroups">
                    {
                        this.state.soundGroups.map((group, index) =>
                            <SoundGroup key={index} index={index.toString()} name={group.name} binding={group.binding} sounds={group.sounds} />
                        )
                    }
                </div>
                <div>
                    <button>Import</button>
                    <button onClick={() => this.export()}>Export</button>
                </div>
            </div>
        );




        return this.soundboard;
    }

    addSoundGroup() {
        this.setState({ soundGroups: [...this.state.soundGroups, { name: "Group " + this.state.soundGroups.length, binding: "", sounds: [] }] });
    }

    import() {

    }

    export() {

        const ref = this.soundBoardRef.current;

        console.log(ref);
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