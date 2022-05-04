import React from 'react';
// import Spotify from '../../util/Spotify';
import './SearchBar.css';

export class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            term: ""
        }
        this.search = this.search.bind(this);
        this.handleTermChange = this.handleTermChange.bind(this);
    }
    search() {
        // console.log(this.state.term);
        this.props.onSearch(this.state.term);
        // window.addEventListener('load', e => {
        //     e.preventDefault();
        //     Spotify.getAccessToken();
        // });
    }
    handleTermChange(event) {
        // console.log(event.target.value);
        this.setState({ term: event.target.value })
        // this.search(e.target.value);
    }
    render() {
        return (
            <div className="SearchBar">
                <input 
                    placeholder="Enter a song, album or an Artist"
                    onChange={this.handleTermChange} />
                <button onClick={this.search} className="SearchButton">Search</button>
            </div>
        )
    }
}
