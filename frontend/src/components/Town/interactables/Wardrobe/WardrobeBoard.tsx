import WardrobeAreaController from "../../../../classes/interactable/TownWardrobe/WardrobeAreaController";
import { IconButton, Button, chakra, Container, useToast } from "@chakra-ui/react";
import LinkIcon from '@material-ui/icons/Link';
import React, { useEffect, useState } from "react";

export type WardrobeProps = {
    wardrobeAreaController: WardrobeAreaController;
};
const StyledWardrobeBoard = chakra(Container, {
    baseStyle: {
        display: 'flex',
        width: '350px',
        height: '350px',
        padding: '5px',
        flexWrap: 'wrap',
    },
});
const StyledWardrobeSquare = chakra(IconButton, {
    baseStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        flexBasis: '14%',
        border: '1px solid black',
        height: '14%',
        fontSize: '50px',
        _disabled: {
            opacity: '100%',
        },
    },
});


/**
 * Render a wardrobe board: a table with two rows
 * First row is a list of hair options
 * Second row is a list of clothing options
 * Each cell is a button with a picture of the option on it, and clicking the button applies the change to the player
 * "Confirm Changes" button at the bottom of the board to apply all sprite changes
 * Exiting the wardrobe board without applying changes will revert the player's sprite to the state before entering the wardrobe
 * Load the options from the Wardrobe Object (or hardcode if needed)
 * 
 * @param param0 
 * 
 * @returns 
 */

export default function WardrobeBoard({
    wardrobeAreaController,
}: WardrobeProps): JSX.Element {
    //Link Icons here are placeholders until the images can be properly imported
    return (
        <StyledWardrobeBoard aria-label='Wardrobe Selection Board'>
            <StyledWardrobeSquare aria-label='Hair Option 1' icon={LinkIcon} />
            <StyledWardrobeSquare aria-label='Hair Option 2' icon={LinkIcon} />
            <StyledWardrobeSquare aria-label='Clothing Option 1' icon={LinkIcon} />
            <StyledWardrobeSquare aria-label='Clothing Option 2' icon={LinkIcon} />
            <Button aria-label='Confirm Changes'>Confirm Changes</Button>
        </StyledWardrobeBoard>
    );
}