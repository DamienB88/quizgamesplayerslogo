// SearchBar.js
import React, { useState } from 'react';

const SearchBar = ({ onGuessSubmit }) => {
    const [userGuess, setUserGuess] = useState('');

    const handleInputChange = (event) => {
        setUserGuess(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onGuessSubmit(userGuess);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Your guess"
                    value={userGuess}
                    onChange={handleInputChange}
                />
                <button type="submit">Submit Guess</button>
            </form>
        </div>
    );
};

export default SearchBar;

